<?php

declare(strict_types=1);

namespace App\Modules\Order\Controllers\Api;

use App\Core\Helpers\ResponseHelper;
use App\Http\Controllers\Controller;
use App\Modules\Order\DTOs\CheckoutDTO;
use App\Modules\Order\Requests\CheckoutRequest;
use App\Modules\Order\Requests\ValidateCheckoutRequest;
use App\Modules\Order\Resources\OrderDetailResource;
use App\Modules\Order\Services\CheckoutService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Class CheckoutController
 *
 * Storefront checkout orchestration endpoints.
 *
 * @package App\Modules\Order\Controllers\Api
 */
class CheckoutController extends Controller
{
    public function __construct(
        protected CheckoutService $checkoutService
    ) {
    }

    public function process(CheckoutRequest $request): JsonResponse
    {
        $userId = $request->user()?->id;
        $sessionId = $request->header('X-Session-Id', $request->input('session_id'));
        $dto = CheckoutDTO::fromRequest($request);

        $result = $this->checkoutService->processCheckout($userId, $sessionId, $dto);

        return ResponseHelper::created(
            data: [
                'order' => new OrderDetailResource($result['order']),
                'payment' => $result['payment'],
            ],
            message: 'Order placed successfully.'
        );
    }

    public function validate(ValidateCheckoutRequest $request): JsonResponse
    {
        $userId = $request->user()?->id;
        $sessionId = $request->header('X-Session-Id', $request->input('session_id'));

        $result = $this->checkoutService->validateCheckout($userId, $sessionId, $request->validated());

        return ResponseHelper::success(
            data: $result,
            message: 'Checkout validation successful.'
        );
    }

    public function shippingRates(Request $request): JsonResponse
    {
        $rates = [
            [
                'id' => 'standard',
                'name' => 'Standard Ground Delivery',
                'carrier' => 'USPS',
                'cost' => 0.00,
                'estimated_days' => '3-5 business days',
            ],
            [
                'id' => 'express',
                'name' => 'Express Air Delivery',
                'carrier' => 'FedEx',
                'cost' => 15.00,
                'estimated_days' => '1-2 business days',
            ],
        ];

        return ResponseHelper::success(
            data: $rates,
            message: 'Shipping rates calculated successfully.'
        );
    }

    public function tax(Request $request): JsonResponse
    {
        return ResponseHelper::success(
            data: [
                'tax_rate' => 0.0,
                'tax_amount' => 0.0,
                'jurisdiction' => $request->input('country_code', 'US'),
            ],
            message: 'Tax calculation completed.'
        );
    }
}
