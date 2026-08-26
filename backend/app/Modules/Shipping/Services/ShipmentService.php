<?php

declare(strict_types=1);

namespace App\Modules\Shipping\Services;

use App\Core\Exceptions\AuthorizationException;
use App\Core\Exceptions\BusinessRuleException;
use App\Core\Exceptions\EntityNotFoundException;
use App\Modules\Order\Contracts\OrderRepositoryInterface;
use App\Modules\Order\Enums\OrderStatus;
use App\Modules\Order\Models\Order;
use App\Modules\Shipping\Contracts\ShipmentRepositoryInterface;
use App\Modules\Shipping\Contracts\ShipTrackingEventRepositoryInterface;
use App\Modules\Shipping\DTOs\CreateShipmentDTO;
use App\Modules\Shipping\DTOs\UpdateShipmentStatusDTO;
use App\Modules\Shipping\Enums\ShipmentStatus;
use App\Modules\Shipping\Events\ShipmentCreated;
use App\Modules\Shipping\Events\ShipmentStatusUpdated;
use App\Modules\Shipping\Models\Shipment;
use App\Modules\Shipping\Services\Gateways\CarrierGatewayManager;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

/**
 * Class ShipmentService
 *
 * @package App\Modules\Shipping\Services
 */
class ShipmentService
{
    public function __construct(
        private readonly ShipmentRepositoryInterface $shipmentRepository,
        private readonly ShipTrackingEventRepositoryInterface $trackingRepository,
        private readonly OrderRepositoryInterface $orderRepository,
        private readonly CarrierGatewayManager $carrierManager,
        private readonly ShipmentStateMachine $stateMachine
    ) {
    }

    public function createShipmentForOrder(string $orderId, CreateShipmentDTO $dto): Shipment
    {
        return DB::transaction(function () use ($orderId, $dto) {
            /** @var Order|null $order */
            $order = Order::query()->lockForUpdate()->find($orderId);

            if (!$order) {
                throw new EntityNotFoundException('Order', $orderId);
            }

            if (in_array($order->status, [OrderStatus::CANCELLED, OrderStatus::REFUNDED], true)) {
                throw new BusinessRuleException(
                    message: "Cannot create shipment for order in {$order->status->value} state.",
                    codeOrStatus: 422,
                    errorCodeOrPrevious: 'ORDER_NOT_FULFILLABLE'
                );
            }

            $existingShipment = $this->shipmentRepository->findByOrderId($orderId);
            if ($existingShipment && $existingShipment->status !== ShipmentStatus::FAILED) {
                throw new BusinessRuleException(
                    message: "Order {$order->order_number} already has an active shipment.",
                    codeOrStatus: 422,
                    errorCodeOrPrevious: 'SHIPMENT_ALREADY_EXISTS'
                );
            }

            $gateway = $this->carrierManager->gateway($dto->carrier);
            $carrierResult = $gateway->createShipment($dto);

            if (!$carrierResult->isSuccess) {
                throw new BusinessRuleException(
                    message: "Carrier booking failed: {$carrierResult->errorMessage}",
                    codeOrStatus: 422,
                    errorCodeOrPrevious: 'CARRIER_BOOKING_FAILED'
                );
            }

            $trackingNumber = $carrierResult->trackingNumber ?: $dto->trackingNumber;
            $trackingUrl = $carrierResult->trackingUrl ?: $dto->trackingUrl;
            $labelUrl = $carrierResult->labelUrl ?: $dto->labelUrl;
            $cost = $carrierResult->cost ?? $dto->cost;

            /** @var Shipment $shipment */
            $shipment = $this->shipmentRepository->createShipment([
                'order_id' => $order->id,
                'warehouse_id' => $dto->warehouseId,
                'carrier' => $dto->carrier,
                'service_level' => $dto->serviceLevel ?? 'standard',
                'tracking_number' => $trackingNumber,
                'tracking_url' => $trackingUrl,
                'status' => ShipmentStatus::LABEL_CREATED,
                'shipped_at' => null,
                'estimated_delivery' => now()->addDays(3)->toDateString(),
                'weight' => $dto->weight ?? 1.0,
                'cost' => $cost,
                'label_url' => $labelUrl,
            ]);

            $this->trackingRepository->recordEvent([
                'shipment_id' => $shipment->id,
                'status' => ShipmentStatus::LABEL_CREATED->value,
                'location' => 'Fulfillment Warehouse',
                'description' => "Shipping label created for carrier {$dto->carrier}.",
                'occurred_at' => now(),
            ]);

            event(new ShipmentCreated($shipment));

            return $shipment->load(['trackingEvents', 'warehouse', 'order']);
        });
    }

    public function updateShipmentStatus(UpdateShipmentStatusDTO $dto): Shipment
    {
        return DB::transaction(function () use ($dto) {
            /** @var Shipment|null $shipment */
            $shipment = Shipment::query()->lockForUpdate()->find($dto->shipmentId);

            if (!$shipment) {
                throw new EntityNotFoundException('Shipment', $dto->shipmentId);
            }

            $oldStatus = $shipment->status;
            $this->stateMachine->applyTransition($shipment, $dto->status);
            $shipment->save();

            $this->trackingRepository->recordEvent([
                'shipment_id' => $shipment->id,
                'status' => $dto->status->value,
                'location' => $dto->location,
                'description' => $dto->description ?: "Shipment status updated to {$dto->status->label()}.",
                'occurred_at' => now(),
            ]);

            event(new ShipmentStatusUpdated($shipment, $oldStatus));

            return $shipment->load(['trackingEvents', 'warehouse', 'order']);
        });
    }

    public function getShipmentById(string $id): Shipment
    {
        /** @var Shipment|null $shipment */
        $shipment = $this->shipmentRepository->findById($id);

        if (!$shipment) {
            throw new EntityNotFoundException('Shipment', $id);
        }

        return $shipment->load(['trackingEvents', 'warehouse', 'order.user']);
    }

    public function getCustomerTracking(string $orderId, string $userId): array
    {
        /** @var Order|null $order */
        $order = $this->orderRepository->findById($orderId);

        if (!$order) {
            throw new EntityNotFoundException('Order', $orderId);
        }

        if ((string) $order->user_id !== $userId) {
            throw new AuthorizationException('You are not authorized to view tracking for this order.');
        }

        $shipment = $this->shipmentRepository->findByOrderId($orderId);

        if (!$shipment) {
            return [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'status' => $order->status->value,
                'tracking' => null,
                'events' => [],
            ];
        }

        return [
            'order_id' => $order->id,
            'order_number' => $order->order_number,
            'shipment_id' => $shipment->id,
            'carrier' => $shipment->carrier,
            'service_level' => $shipment->service_level,
            'tracking_number' => $shipment->tracking_number,
            'tracking_url' => $shipment->tracking_url,
            'status' => $shipment->status->value,
            'shipped_at' => $shipment->shipped_at?->toIso8601String(),
            'estimated_delivery' => $shipment->estimated_delivery?->toDateString(),
            'delivered_at' => $shipment->delivered_at?->toIso8601String(),
            'events' => $shipment->trackingEvents->map(fn ($e) => [
                'id' => $e->id,
                'status' => $e->status,
                'location' => $e->location,
                'description' => $e->description,
                'occurred_at' => $e->occurred_at->toIso8601String(),
            ])->toArray(),
        ];
    }

    public function paginateShipments(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        return $this->shipmentRepository->paginateForAdmin($filters, $perPage);
    }
}
