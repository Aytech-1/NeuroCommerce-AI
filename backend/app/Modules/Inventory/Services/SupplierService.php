<?php

declare(strict_types=1);

namespace App\Modules\Inventory\Services;

use App\Core\Abstracts\AbstractService;
use App\Core\Exceptions\EntityNotFoundException;
use App\Modules\Inventory\Contracts\SupplierRepositoryInterface;
use App\Modules\Inventory\DTOs\StoreSupplierDTO;
use App\Modules\Inventory\DTOs\UpdateSupplierDTO;
use App\Modules\Inventory\Models\Supplier;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * Class SupplierService
 *
 * @package App\Modules\Inventory\Services
 */
class SupplierService extends AbstractService
{
    public function __construct(
        protected SupplierRepositoryInterface $supplierRepository
    ) {
    }

    public function listSuppliers(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        return $this->supplierRepository->paginateSuppliers($filters, $perPage);
    }

    public function getSupplierById(string $id): Supplier
    {
        $supplier = $this->supplierRepository->findById($id);

        if (!$supplier) {
            throw new EntityNotFoundException('Supplier', $id);
        }

        return $supplier;
    }

    public function createSupplier(StoreSupplierDTO $dto): Supplier
    {
        return $this->executeInTransaction(fn () => $this->supplierRepository->create($dto->toArray()));
    }

    public function updateSupplier(string $id, UpdateSupplierDTO $dto): Supplier
    {
        return $this->executeInTransaction(function () use ($id, $dto) {
            $this->getSupplierById($id);
            $data = array_filter($dto->toArray(), fn ($v) => $v !== null);
            return $this->supplierRepository->update($id, $data);
        });
    }

    public function deleteSupplier(string $id): bool
    {
        $this->getSupplierById($id);
        return $this->supplierRepository->delete($id);
    }

    public function syncProducts(string $supplierId, array $products): void
    {
        $this->getSupplierById($supplierId);
        $this->supplierRepository->syncProducts($supplierId, $products);
    }
}
