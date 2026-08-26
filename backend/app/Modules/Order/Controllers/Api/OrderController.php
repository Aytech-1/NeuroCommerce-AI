<?php

declare(strict_types=1);

namespace App\Modules\Order\Controllers\Api;

use App\Core\Helpers\PaginationHelper;
use App\Core\Helpers\ResponseHelper;
use App\Http\Controllers\Controller;
use App\Modules\Order\Requests\CancelOrderRequest;
use App\Modules\Order\Resources\InvoiceResource;
use App\Modules\Order\Resources\OrderDetailResource;
use App\Modules\Order\Resources\OrderItemResource;
use App\Modules\Order\Resources\OrderResource;
use App\Modules\Order\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Class OrderController
 *
 * Customer-facing order lookup, items, tracking, cancellation, and invoice download endpoints.
 *
 * @package App\Modules\Order\Controllers\Api
 */
class OrderController extends Controller
{
    public function __construct(
        protected OrderService $orderService
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()->id;
        $perPage = PaginationHelper::getPerPage($request);
        $filters = $request->only(['status']);

        $paginator = $this->orderService->getCustomerOrders($userId, $filters, $perPage);

        return ResponseHelper::paginated($paginator, OrderResource::class);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $userId = $request->user()->id;
        $order = $this->orderService->getOrderById($id, $userId);

        return ResponseHelper::success(
            data: new OrderDetailResource($order),
            message: 'Order retrieved successfully.'
        );
    }

    public function items(Request $request, string $id): JsonResponse
    {
        $userId = $request->user()->id;
        $order = $this->orderService->getOrderById($id, $userId);

        return ResponseHelper::success(
            data: OrderItemResource::collection($order->items),
            message: 'Order items retrieved successfully.'
        );
    }

    public function tracking(Request $request, string $id): JsonResponse
    {
        $userId = $request->user()->id;
        $order = $this->orderService->getOrderById($id, $userId);

        return ResponseHelper::success(
            data: [
                'order_number' => $order->order_number,
                'status' => $order->status->value,
                'shipping_method' => $order->shipping_method ?: 'Standard Delivery',
                'tracking_number' => 'TRK' . strtoupper(substr(md5($order->id), 0, 10)),
                'carrier' => 'USPS',
                'estimated_delivery' => $order->placed_at?->addDays(5)->toIso8601String(),
            ],
            message: 'Shipment tracking information.'
        );
    }

    public function cancel(CancelOrderRequest $request, string $id): JsonResponse
    {
        $userId = $request->user()->id;
        $reason = (string) $request->input('reason');

        $order = $this->orderService->cancelOrder($id, $userId, $reason);

        return ResponseHelper::success(
            data: new OrderDetailResource($order),
            message: 'Order cancelled successfully.'
        );
    }

    public function invoice(Request $request, string $id): JsonResponse
    {
        $userId = $request->user()->id;
        $invoice = $this->orderService->getInvoice($id, $userId);

        return ResponseHelper::success(
            data: new InvoiceResource($invoice),
            message: 'Invoice retrieved successfully.'
        );
    }
}
