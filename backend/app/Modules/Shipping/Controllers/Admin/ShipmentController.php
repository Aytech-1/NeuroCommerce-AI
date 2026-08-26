<?php

declare(strict_types=1);

namespace App\Modules\Shipping\Controllers\Admin;

use App\Core\Helpers\PaginationHelper;
use App\Core\Helpers\ResponseHelper;
use App\Http\Controllers\Controller;
use App\Modules\Shipping\DTOs\CreateShipmentDTO;
use App\Modules\Shipping\DTOs\UpdateShipmentStatusDTO;
use App\Modules\Shipping\Enums\ShipmentStatus;
use App\Modules\Shipping\Models\Shipment;
use App\Modules\Shipping\Requests\CreateShipmentRequest;
use App\Modules\Shipping\Requests\UpdateShipmentStatusRequest;
use App\Modules\Shipping\Resources\ShipmentResource;
use App\Modules\Shipping\Services\ShipmentService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Class ShipmentController
 *
 * @package App\Modules\Shipping\Controllers\Admin
 */
class ShipmentController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private readonly ShipmentService $shipmentService
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Shipment::class);

        $perPage = PaginationHelper::getPerPage($request);
        $filters = $request->only(['status', 'carrier', 'warehouse_id', 'search']);

        $paginator = $this->shipmentService->paginateShipments($filters, $perPage);

        return ResponseHelper::paginated($paginator, ShipmentResource::class);
    }

    public function show(string $id): JsonResponse
    {
        $shipment = $this->shipmentService->getShipmentById($id);
        $this->authorize('view', $shipment);

        return ResponseHelper::success(
            data: new ShipmentResource($shipment),
            message: 'Shipment retrieved successfully.'
        );
    }

    public function createForOrder(string $id, CreateShipmentRequest $request): JsonResponse
    {
        $this->authorize('create', Shipment::class);

        $dto = new CreateShipmentDTO(
            orderId: $id,
            warehouseId: (string) $request->input('warehouse_id'),
            carrier: (string) $request->input('carrier'),
            serviceLevel: $request->input('service_level'),
            trackingNumber: $request->input('tracking_number'),
            trackingUrl: $request->input('tracking_url'),
            weight: $request->has('weight') ? (float) $request->input('weight') : null,
            cost: $request->has('cost') ? (float) $request->input('cost') : null,
            labelUrl: $request->input('label_url')
        );

        $shipment = $this->shipmentService->createShipmentForOrder($id, $dto);

        return ResponseHelper::created(
            data: new ShipmentResource($shipment),
            message: 'Shipment created successfully.'
        );
    }

    public function updateStatus(string $id, UpdateShipmentStatusRequest $request): JsonResponse
    {
        $shipment = $this->shipmentService->getShipmentById($id);
        $this->authorize('update', $shipment);

        $dto = new UpdateShipmentStatusDTO(
            shipmentId: $id,
            status: ShipmentStatus::from((string) $request->input('status')),
            location: $request->input('location'),
            description: $request->input('description')
        );

        $updatedShipment = $this->shipmentService->updateShipmentStatus($dto);

        return ResponseHelper::success(
            data: new ShipmentResource($updatedShipment),
            message: 'Shipment status updated successfully.'
        );
    }
}
