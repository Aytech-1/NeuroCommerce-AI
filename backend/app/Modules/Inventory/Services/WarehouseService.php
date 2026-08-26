<?php

declare(strict_types=1);

namespace App\Modules\Inventory\Services;

use App\Core\Abstracts\AbstractService;
use App\Core\Exceptions\BusinessRuleException;
use App\Core\Exceptions\EntityNotFoundException;
use App\Modules\Inventory\Contracts\WarehouseRepositoryInterface;
use App\Modules\Inventory\DTOs\StoreWarehouseDTO;
use App\Modules\Inventory\DTOs\UpdateWarehouseDTO;
use App\Modules\Inventory\Models\Warehouse;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * Class WarehouseService
 *
 * @package App\Modules\Inventory\Services
 */
class WarehouseService extends AbstractService
{
    public function __construct(
        protected WarehouseRepositoryInterface $warehouseRepository
    ) {
    }

    public function listWarehouses(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        return $this->warehouseRepository->paginateWarehouses($filters, $perPage);
    }

    public function getWarehouseById(string $id): Warehouse
    {
        $warehouse = $this->warehouseRepository->findById($id);

        if (!$warehouse) {
            throw new EntityNotFoundException('Warehouse', $id);
        }

        return $warehouse;
    }

    public function createWarehouse(StoreWarehouseDTO $dto): Warehouse
    {
        return $this->executeInTransaction(function () use ($dto) {
            if ($dto->is_default) {
                // Remove default flag from other warehouses
                Warehouse::where('is_default', true)->update(['is_default' => false]);
            }

            return $this->warehouseRepository->create($dto->toArray());
        });
    }

    public function updateWarehouse(string $id, UpdateWarehouseDTO $dto): Warehouse
    {
        return $this->executeInTransaction(function () use ($id, $dto) {
            $warehouse = $this->getWarehouseById($id);

            $data = array_filter($dto->toArray(), fn ($v) => $v !== null);

            if ($dto->is_default === true) {
                Warehouse::where('id', '!=', $id)->where('is_default', true)->update(['is_default' => false]);
            }

            return $this->warehouseRepository->update($id, $data);
        });
    }

    public function deleteWarehouse(string $id): bool
    {
        $warehouse = $this->getWarehouseById($id);

        if ($warehouse->inventoryItems()->where('quantity_on_hand', '>', 0)->exists()) {
            throw new BusinessRuleException('Cannot delete warehouse with active stock on hand.');
        }

        return $this->warehouseRepository->delete($id);
    }
}
