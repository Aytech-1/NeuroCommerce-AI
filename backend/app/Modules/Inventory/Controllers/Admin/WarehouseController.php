<?php

declare(strict_types=1);

namespace App\Modules\Inventory\Controllers\Admin;

use App\Core\Helpers\ResponseHelper;
use App\Http\Controllers\Controller;
use App\Modules\Inventory\Models\Warehouse;
use App\Modules\Inventory\Requests\StoreWarehouseRequest;
use App\Modules\Inventory\Requests\UpdateWarehouseRequest;
use App\Modules\Inventory\Resources\WarehouseResource;
use App\Modules\Inventory\Services\WarehouseService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

/**
 * Class WarehouseController
 *
 * @package App\Modules\Inventory\Controllers\Admin
 */
class WarehouseController extends Controller
{
    public function __construct(
        protected WarehouseService $warehouseService
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', Warehouse::class);

        $perPage = (int) $request->query('per_page', 20);
        $filters = $request->query('filter', []);
        $filters['search'] = $request->query('search');

        $warehouses = $this->warehouseService->listWarehouses($filters, $perPage);

        return ResponseHelper::paginated($warehouses, WarehouseResource::class);
    }

    public function show(string $id): JsonResponse
    {
        $warehouse = $this->warehouseService->getWarehouseById($id);
        Gate::authorize('view', $warehouse);

        $warehouse->load('address');

        return ResponseHelper::success(
            new WarehouseResource($warehouse),
            'Warehouse retrieved successfully.'
        );
    }

    public function store(StoreWarehouseRequest $request): JsonResponse
    {
        Gate::authorize('create', Warehouse::class);

        $warehouse = $this->warehouseService->createWarehouse($request->toDTO());

        return ResponseHelper::created(
            new WarehouseResource($warehouse),
            'Warehouse created successfully.'
        );
    }

    public function update(string $id, UpdateWarehouseRequest $request): JsonResponse
    {
        $warehouse = $this->warehouseService->getWarehouseById($id);
        Gate::authorize('update', $warehouse);

        $updated = $this->warehouseService->updateWarehouse($id, $request->toDTO());

        return ResponseHelper::success(
            new WarehouseResource($updated),
            'Warehouse updated successfully.'
        );
    }

    public function destroy(string $id): JsonResponse
    {
        $warehouse = $this->warehouseService->getWarehouseById($id);
        Gate::authorize('delete', $warehouse);

        $this->warehouseService->deleteWarehouse($id);

        return ResponseHelper::noContent('Warehouse deleted successfully.');
    }
}
