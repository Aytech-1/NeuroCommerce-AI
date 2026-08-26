<?php

declare(strict_types=1);

namespace App\Modules\Shipping\Controllers\Api;

use App\Core\Helpers\ResponseHelper;
use App\Http\Controllers\Controller;
use App\Modules\Shipping\DTOs\ShippingRateEstimateDTO;
use App\Modules\Shipping\Requests\CalculateShippingRatesRequest;
use App\Modules\Shipping\Resources\ShippingRateResource;
use App\Modules\Shipping\Services\ShipmentService;
use App\Modules\Shipping\Services\ShippingRateService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Class ShippingController
 *
 * @package App\Modules\Shipping\Controllers\Api
 */
class ShippingController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private readonly ShippingRateService $rateService,
        private readonly ShipmentService $shipmentService
    ) {
    }

    public function calculateRates(CalculateShippingRatesRequest $request): JsonResponse
    {
        $dto = new ShippingRateEstimateDTO(
            countryCode: (string) $request->input('country_code'),
            weight: (float) $request->input('weight', 1.0),
            orderAmount: (float) $request->input('order_amount', 0.0),
            postalCode: $request->input('postal_code'),
            city: $request->input('city')
        );

        $rates = $this->rateService->estimateRates($dto);

        return ResponseHelper::success(
            data: ShippingRateResource::collection($rates),
            message: 'Available shipping rates calculated successfully.'
        );
    }

    public function trackOrder(Request $request, string $id): JsonResponse
    {
        $userId = (string) $request->user()?->id;

        $trackingData = $this->shipmentService->getCustomerTracking(
            orderId: $id,
            userId: $userId
        );

        return ResponseHelper::success(
            data: $trackingData,
            message: 'Order tracking details retrieved successfully.'
        );
    }
}
