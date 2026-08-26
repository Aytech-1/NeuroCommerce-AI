<?php

declare(strict_types=1);

namespace App\Modules\Inventory\Services;

use App\Core\Abstracts\AbstractService;
use App\Core\Exceptions\BusinessRuleException;
use App\Core\Exceptions\EntityNotFoundException;
use App\Modules\Inventory\Contracts\InventoryRepositoryInterface;
use App\Modules\Inventory\Contracts\StockMovementRepositoryInterface;
use App\Modules\Inventory\Contracts\WarehouseRepositoryInterface;
use App\Modules\Inventory\DTOs\AdjustStockDTO;
use App\Modules\Inventory\DTOs\TransferStockDTO;
use App\Modules\Inventory\Enums\StockMovementType;
use App\Modules\Inventory\Events\StockAdjusted;
use App\Modules\Inventory\Events\StockLow;
use App\Modules\Inventory\Events\StockReleased;
use App\Modules\Inventory\Events\StockReserved;
use App\Modules\Inventory\Models\InventoryItem;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

/**
 * Class InventoryService
 *
 * Authoritative business service for inventory mutations, pessimistic stock locking,
 * reservation lifecycles, and low-stock detection.
 *
 * @package App\Modules\Inventory\Services
 */
class InventoryService extends AbstractService
{
    public function __construct(
        protected InventoryRepositoryInterface $inventoryRepository,
        protected StockMovementRepositoryInterface $stockMovementRepository,
        protected WarehouseRepositoryInterface $warehouseRepository
    ) {
    }

    public function listInventory(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        return $this->inventoryRepository->paginateInventory($filters, $perPage);
    }

    public function getInventoryItemById(string $id): InventoryItem
    {
        $item = $this->inventoryRepository->findById($id);

        if (!$item) {
            throw new EntityNotFoundException('InventoryItem', $id);
        }

        return $item;
    }

    public function getAvailableStock(string $productId, ?string $variantId = null): int
    {
        return $this->inventoryRepository->getTotalAvailableStock($productId, $variantId);
    }

    public function getLowStockItems(int $perPage = 20): LengthAwarePaginator
    {
        return $this->inventoryRepository->getLowStockItems($perPage);
    }

    /**
     * Authoritatively adjust stock levels with pessimistic locking and movement auditing.
     */
    public function adjustStock(AdjustStockDTO $dto, ?string $userId = null): InventoryItem
    {
        return $this->executeInTransaction(function () use ($dto, $userId) {
            $item = $this->inventoryRepository->lockItemForUpdate(
                $dto->product_id,
                $dto->variant_id,
                $dto->warehouse_id
            );

            if (!$item) {
                if ($dto->quantity_delta < 0) {
                    throw new BusinessRuleException('Cannot deduct stock from a non-existent inventory location.');
                }

                // Create initial inventory item
                $item = $this->inventoryRepository->create([
                    'product_id' => $dto->product_id,
                    'variant_id' => $dto->variant_id,
                    'warehouse_id' => $dto->warehouse_id,
                    'quantity_on_hand' => 0,
                    'quantity_reserved' => 0,
                    'reorder_point' => 10,
                    'reorder_quantity' => 50,
                ]);

                // Re-lock
                $item = $this->inventoryRepository->lockItemForUpdate(
                    $dto->product_id,
                    $dto->variant_id,
                    $dto->warehouse_id
                );
            }

            $newOnHand = $item->quantity_on_hand + $dto->quantity_delta;

            if ($newOnHand < 0) {
                throw new BusinessRuleException(
                    "Physical quantity on hand cannot be negative. Current: {$item->quantity_on_hand}, Requested delta: {$dto->quantity_delta}"
                );
            }

            if ($newOnHand < $item->quantity_reserved) {
                throw new BusinessRuleException(
                    "Physical quantity cannot be reduced below reserved quantity ({$item->quantity_reserved})."
                );
            }

            $item->quantity_on_hand = $newOnHand;
            $item->save();

            // Record immutable stock movement
            $this->stockMovementRepository->recordMovement([
                'inventory_item_id' => $item->id,
                'movement_type' => $dto->movement_type->value,
                'quantity' => $dto->quantity_delta,
                'reference_type' => $dto->reference_type,
                'reference_id' => $dto->reference_id,
                'notes' => $dto->notes,
                'performed_by' => $userId,
            ]);

            // Dispatch domain event
            $this->dispatchDomainEvent(new StockAdjusted(
                inventoryItem: $item,
                quantityDelta: $dto->quantity_delta,
                movementType: $dto->movement_type,
                performedBy: $userId,
                notes: $dto->notes
            ));

            if ($item->isLowStock()) {
                $this->dispatchDomainEvent(new StockLow(
                    inventoryItem: $item,
                    currentAvailable: $item->quantity_available,
                    reorderPoint: $item->reorder_point
                ));
            }

            return $item->fresh(['product', 'variant', 'warehouse']);
        });
    }

    /**
     * Transfer stock atomically between two warehouses.
     */
    public function transferStock(TransferStockDTO $dto, ?string $userId = null): array
    {
        return $this->executeInTransaction(function () use ($dto, $userId) {
            // Lock source and destination deterministically
            $warehouseIds = [$dto->source_warehouse_id, $dto->destination_warehouse_id];
            sort($warehouseIds);

            $sourceItem = null;
            $destItem = null;

            foreach ($warehouseIds as $wId) {
                $locked = $this->inventoryRepository->lockItemForUpdate(
                    $dto->product_id,
                    $dto->variant_id,
                    $wId
                );

                if ($wId === $dto->source_warehouse_id) {
                    $sourceItem = $locked;
                } else {
                    $destItem = $locked;
                }
            }

            if (!$sourceItem || $sourceItem->quantity_available < $dto->quantity) {
                $available = $sourceItem ? $sourceItem->quantity_available : 0;
                throw new BusinessRuleException("Insufficient available stock in source warehouse. Available: {$available}, Requested: {$dto->quantity}");
            }

            if (!$destItem) {
                $destItem = $this->inventoryRepository->create([
                    'product_id' => $dto->product_id,
                    'variant_id' => $dto->variant_id,
                    'warehouse_id' => $dto->destination_warehouse_id,
                    'quantity_on_hand' => 0,
                    'quantity_reserved' => 0,
                    'reorder_point' => 10,
                    'reorder_quantity' => 50,
                ]);
            }

            // Decrement source
            $sourceItem->quantity_on_hand -= $dto->quantity;
            $sourceItem->save();

            // Increment destination
            $destItem->quantity_on_hand += $dto->quantity;
            $destItem->save();

            // Record source movement
            $this->stockMovementRepository->recordMovement([
                'inventory_item_id' => $sourceItem->id,
                'movement_type' => StockMovementType::TRANSFER->value,
                'quantity' => -$dto->quantity,
                'reference_type' => 'WarehouseTransfer',
                'reference_id' => $destItem->warehouse_id,
                'notes' => $dto->notes ?? "Transfer out to warehouse {$dto->destination_warehouse_id}",
                'performed_by' => $userId,
            ]);

            // Record destination movement
            $this->stockMovementRepository->recordMovement([
                'inventory_item_id' => $destItem->id,
                'movement_type' => StockMovementType::TRANSFER->value,
                'quantity' => $dto->quantity,
                'reference_type' => 'WarehouseTransfer',
                'reference_id' => $sourceItem->warehouse_id,
                'notes' => $dto->notes ?? "Transfer in from warehouse {$dto->source_warehouse_id}",
                'performed_by' => $userId,
            ]);

            return [
                'source_item' => $sourceItem->fresh(),
                'destination_item' => $destItem->fresh(),
            ];
        });
    }

    /**
     * Reserve temporary stock for checkout with 15-min TTL and deadlock-free deterministic locking.
     */
    public function reserveStock(array $items, int $ttlMinutes = 15): string
    {
        $reservationId = (string) Str::uuid();

        // Sort items deterministically to prevent cross-transaction deadlocks
        usort($items, function ($a, $b) {
            $keyA = ($a['product_id'] ?? '') . ($a['variant_id'] ?? '') . ($a['warehouse_id'] ?? '');
            $keyB = ($b['product_id'] ?? '') . ($b['variant_id'] ?? '') . ($b['warehouse_id'] ?? '');
            return strcmp($keyA, $keyB);
        });

        $reservedItemRecords = [];

        $this->executeInTransaction(function () use ($items, $reservationId, $ttlMinutes, &$reservedItemRecords) {
            foreach ($items as $itemData) {
                $productId = (string) $itemData['product_id'];
                $variantId = $itemData['variant_id'] ?? null;
                $quantity = (int) $itemData['quantity'];
                $warehouseId = $itemData['warehouse_id'] ?? null;

                if (!$warehouseId) {
                    $defaultWarehouse = $this->warehouseRepository->getDefaultWarehouse();
                    $warehouseId = $defaultWarehouse ? $defaultWarehouse->id : null;
                }

                if (!$warehouseId) {
                    throw new BusinessRuleException('No active warehouse configured for stock fulfillment.');
                }

                $invItem = $this->inventoryRepository->lockItemForUpdate($productId, $variantId, $warehouseId);

                if (!$invItem || $invItem->quantity_available < $quantity) {
                    $available = $invItem ? $invItem->quantity_available : 0;
                    throw new BusinessRuleException(
                        "Insufficient stock available to complete reservation. Requested: {$quantity}, Available: {$available}"
                    );
                }

                $invItem->quantity_reserved += $quantity;
                $invItem->save();

                $this->stockMovementRepository->recordMovement([
                    'inventory_item_id' => $invItem->id,
                    'movement_type' => StockMovementType::RESERVATION->value,
                    'quantity' => -$quantity,
                    'reference_type' => 'StockReservation',
                    'reference_id' => $reservationId,
                    'notes' => "Temporary stock reservation (TTL: {$ttlMinutes}m)",
                    'performed_by' => null,
                ]);

                $reservedItemRecords[] = [
                    'inventory_item_id' => $invItem->id,
                    'product_id' => $productId,
                    'variant_id' => $variantId,
                    'warehouse_id' => $warehouseId,
                    'quantity' => $quantity,
                ];
            }
        });

        $expiresAt = now()->addMinutes($ttlMinutes);

        // Store reservation metadata in cache
        Cache::put("inventory:reservation:{$reservationId}", [
            'reservation_id' => $reservationId,
            'items' => $reservedItemRecords,
            'expires_at' => $expiresAt->timestamp,
        ], $expiresAt);

        $activeReservations = Cache::get('inventory:active_reservations', []);
        $activeReservations[] = $reservationId;
        Cache::forever('inventory:active_reservations', array_unique($activeReservations));

        $this->dispatchDomainEvent(new StockReserved(
            reservationId: $reservationId,
            items: $reservedItemRecords,
            expiresAt: $expiresAt
        ));

        return $reservationId;
    }

    /**
     * Release a temporary reservation and restore available quantity.
     */
    public function releaseStock(string $reservationId, string $reason = 'Checkout Cancelled or Expired'): void
    {
        $reservation = Cache::get("inventory:reservation:{$reservationId}");

        if (!$reservation) {
            return;
        }

        $this->executeInTransaction(function () use ($reservation, $reservationId, $reason) {
            foreach ($reservation['items'] as $item) {
                $invItem = InventoryItem::where('id', $item['inventory_item_id'])->lockForUpdate()->first();

                if ($invItem) {
                    $invItem->quantity_reserved = max(0, $invItem->quantity_reserved - $item['quantity']);
                    $invItem->save();

                    $this->stockMovementRepository->recordMovement([
                        'inventory_item_id' => $invItem->id,
                        'movement_type' => StockMovementType::RELEASE->value,
                        'quantity' => $item['quantity'],
                        'reference_type' => 'StockReservation',
                        'reference_id' => $reservationId,
                        'notes' => "Reservation release: {$reason}",
                        'performed_by' => null,
                    ]);
                }
            }
        });

        Cache::forget("inventory:reservation:{$reservationId}");

        $activeReservations = Cache::get('inventory:active_reservations', []);
        Cache::forever('inventory:active_reservations', array_values(array_diff($activeReservations, [$reservationId])));

        $this->dispatchDomainEvent(new StockReleased(
            reservationId: $reservationId,
            items: $reservation['items'],
            reason: $reason
        ));
    }

    /**
     * Finalize checkout deduction: consume reserved stock and decrease physical on-hand quantity.
     */
    public function deductReservedStock(string $reservationId, ?string $orderId = null, ?string $userId = null): void
    {
        $reservation = Cache::get("inventory:reservation:{$reservationId}");

        if (!$reservation) {
            throw new BusinessRuleException("Stock reservation [{$reservationId}] has expired or does not exist.");
        }

        $this->executeInTransaction(function () use ($reservation, $reservationId, $orderId, $userId) {
            foreach ($reservation['items'] as $item) {
                $invItem = InventoryItem::where('id', $item['inventory_item_id'])->lockForUpdate()->first();

                if ($invItem) {
                    $invItem->quantity_reserved = max(0, $invItem->quantity_reserved - $item['quantity']);
                    $invItem->quantity_on_hand = max(0, $invItem->quantity_on_hand - $item['quantity']);
                    $invItem->save();

                    $this->stockMovementRepository->recordMovement([
                        'inventory_item_id' => $invItem->id,
                        'movement_type' => StockMovementType::SALE->value,
                        'quantity' => -$item['quantity'],
                        'reference_type' => 'Order',
                        'reference_id' => $orderId,
                        'notes' => "Completed order stock fulfillment",
                        'performed_by' => $userId,
                    ]);
                }
            }
        });

        Cache::forget("inventory:reservation:{$reservationId}");

        $activeReservations = Cache::get('inventory:active_reservations', []);
        Cache::forever('inventory:active_reservations', array_values(array_diff($activeReservations, [$reservationId])));
    }
}
