<?php

declare(strict_types=1);

namespace App\Modules\Inventory\Controllers\Admin;

use App\Core\Helpers\ResponseHelper;
use App\Http\Controllers\Controller;
use App\Modules\Inventory\Models\Supplier;
use App\Modules\Inventory\Requests\StoreSupplierRequest;
use App\Modules\Inventory\Requests\UpdateSupplierRequest;
use App\Modules\Inventory\Resources\SupplierResource;
use App\Modules\Inventory\Services\SupplierService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

/**
 * Class SupplierController
 *
 * @package App\Modules\Inventory\Controllers\Admin
 */
class SupplierController extends Controller
{
    public function __construct(
        protected SupplierService $supplierService
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', Supplier::class);

        $perPage = (int) $request->query('per_page', 20);
        $filters = $request->query('filter', []);
        $filters['search'] = $request->query('search');

        $suppliers = $this->supplierService->listSuppliers($filters, $perPage);

        return ResponseHelper::paginated($suppliers, SupplierResource::class);
    }

    public function show(string $id): JsonResponse
    {
        $supplier = $this->supplierService->getSupplierById($id);
        Gate::authorize('view', $supplier);

        $supplier->load('address');

        return ResponseHelper::success(
            new SupplierResource($supplier),
            'Supplier retrieved successfully.'
        );
    }

    public function store(StoreSupplierRequest $request): JsonResponse
    {
        Gate::authorize('create', Supplier::class);

        $supplier = $this->supplierService->createSupplier($request->toDTO());

        return ResponseHelper::created(
            new SupplierResource($supplier),
            'Supplier created successfully.'
        );
    }

    public function update(string $id, UpdateSupplierRequest $request): JsonResponse
    {
        $supplier = $this->supplierService->getSupplierById($id);
        Gate::authorize('update', $supplier);

        $updated = $this->supplierService->updateSupplier($id, $request->toDTO());

        return ResponseHelper::success(
            new SupplierResource($updated),
            'Supplier updated successfully.'
        );
    }

    public function destroy(string $id): JsonResponse
    {
        $supplier = $this->supplierService->getSupplierById($id);
        Gate::authorize('delete', $supplier);

        $this->supplierService->deleteSupplier($id);

        return ResponseHelper::noContent('Supplier deleted successfully.');
    }
}
