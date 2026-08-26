<?php

declare(strict_types=1);

namespace App\Modules\Inventory\Controllers\Admin;

use App\Core\Helpers\ResponseHelper;
use App\Http\Controllers\Controller;
use App\Modules\Inventory\Models\InventoryItem;
use App\Modules\Inventory\Requests\AdjustStockRequest;
use App\Modules\Inventory\Requests\TransferStockRequest;
use App\Modules\Inventory\Resources\InventoryItemResource;
use App\Modules\Inventory\Resources\StockMovementResource;
use App\Modules\Inventory\Services\InventoryService;
use App\Modules\Inventory\Services\StockMovementService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

/**
 * Class InventoryController
 *
 * @package App\Modules\Inventory\Controllers\Admin
 */
class InventoryController extends Controller
{
    public function __construct(
        protected InventoryService $inventoryService,
        protected StockMovementService $stockMovementService
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', InventoryItem::class);

        $perPage = (int) $request->query('per_page', 20);
        $filters = $request->query('filter', []);
        $filters['search'] = $request->query('search');

        $items = $this->inventoryService->listInventory($filters, $perPage);

        return ResponseHelper::paginated($items, InventoryItemResource::class);
    }

    public function show(string $id): JsonResponse
    {
        Gate::authorize('viewAny', InventoryItem::class);

        $item = $this->inventoryService->getInventoryItemById($id);
        $item->load(['product', 'variant', 'warehouse', 'stockMovements.performer']);

        return ResponseHelper::success(
            new InventoryItemResource($item),
            'Inventory item retrieved successfully.'
        );
    }

    public function adjust(AdjustStockRequest $request): JsonResponse
    {
        Gate::authorize('adjust', InventoryItem::class);

        $userId = $request->user()?->id;
        $item = $this->inventoryService->adjustStock($request->toDTO(), $userId);

        return ResponseHelper::success(
            new InventoryItemResource($item),
            'Stock adjusted successfully.'
        );
    }

    public function transfer(TransferStockRequest $request): JsonResponse
    {
        Gate::authorize('transfer', InventoryItem::class);

        $userId = $request->user()?->id;
        $result = $this->inventoryService->transferStock($request->toDTO(), $userId);

        return ResponseHelper::success([
            'source_item' => new InventoryItemResource($result['source_item']),
            'destination_item' => new InventoryItemResource($result['destination_item']),
        ], 'Stock transferred successfully.');
    }

    public function lowStock(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', InventoryItem::class);

        $perPage = (int) $request->query('per_page', 20);
        $items = $this->inventoryService->getLowStockItems($perPage);

        return ResponseHelper::paginated($items, InventoryItemResource::class);
    }

    public function movements(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', InventoryItem::class);

        $perPage = (int) $request->query('per_page', 20);
        $filters = $request->query('filter', []);

        $movements = $this->stockMovementService->listMovements($filters, $perPage);

        return ResponseHelper::paginated($movements, StockMovementResource::class);
    }
}
