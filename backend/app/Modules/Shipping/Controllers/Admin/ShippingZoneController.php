<?php

declare(strict_types=1);

namespace App\Modules\Shipping\Controllers\Admin;

use App\Core\Helpers\PaginationHelper;
use App\Core\Helpers\ResponseHelper;
use App\Http\Controllers\Controller;
use App\Modules\Shipping\Models\ShipZone;
use App\Modules\Shipping\Requests\CreateShippingZoneRequest;
use App\Modules\Shipping\Requests\UpdateShippingZoneRequest;
use App\Modules\Shipping\Resources\ShippingZoneResource;
use App\Modules\Shipping\Services\ShippingRateService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Class ShippingZoneController
 *
 * @package App\Modules\Shipping\Controllers\Admin
 */
class ShippingZoneController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private readonly ShippingRateService $rateService
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', ShipZone::class);

        $perPage = PaginationHelper::getPerPage($request);
        $filters = $request->only(['is_active', 'search']);

        $paginator = $this->rateService->paginateZones($filters, $perPage);

        return ResponseHelper::paginated($paginator, ShippingZoneResource::class);
    }

    public function show(string $id): JsonResponse
    {
        $zone = $this->rateService->getZoneById($id);
        $this->authorize('view', $zone);

        $zone->load('rates');

        return ResponseHelper::success(
            data: new ShippingZoneResource($zone),
            message: 'Shipping zone retrieved successfully.'
        );
    }

    public function store(CreateShippingZoneRequest $request): JsonResponse
    {
        $this->authorize('create', ShipZone::class);

        $zone = $this->rateService->createZone($request->validated());

        return ResponseHelper::created(
            data: new ShippingZoneResource($zone),
            message: 'Shipping zone created successfully.'
        );
    }

    public function update(string $id, UpdateShippingZoneRequest $request): JsonResponse
    {
        $zone = $this->rateService->getZoneById($id);
        $this->authorize('update', $zone);

        $updatedZone = $this->rateService->updateZone($id, $request->validated());

        return ResponseHelper::success(
            data: new ShippingZoneResource($updatedZone),
            message: 'Shipping zone updated successfully.'
        );
    }
}
