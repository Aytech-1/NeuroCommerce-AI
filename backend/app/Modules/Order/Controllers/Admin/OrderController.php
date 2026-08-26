<?php

declare(strict_types=1);

namespace App\Modules\Order\Controllers\Admin;

use App\Core\Helpers\PaginationHelper;
use App\Core\Helpers\ResponseHelper;
use App\Http\Controllers\Controller;
use App\Modules\Order\Requests\AddOrderNoteRequest;
use App\Modules\Order\Requests\UpdateOrderStatusRequest;
use App\Modules\Order\Resources\OrderDetailResource;
use App\Modules\Order\Resources\OrderResource;
use App\Modules\Order\Resources\OrderStatusHistoryResource;
use App\Modules\Order\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Class OrderController
 *
 * Administrative order queue management, status mutations, timeline history, and notes.
 *
 * @package App\Modules\Order\Controllers\Admin
 */
class OrderController extends Controller
{
    public function __construct(
        protected OrderService $orderService
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $perPage = PaginationHelper::getPerPage($request);
        $filters = $request->only(['status', 'search', 'date_from', 'date_to']);

        $paginator = $this->orderService->getAdminOrders($filters, $perPage);

        return ResponseHelper::paginated($paginator, OrderResource::class);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $order = $this->orderService->getOrderById($id);

        return ResponseHelper::success(
            data: new OrderDetailResource($order),
            message: 'Order retrieved successfully.'
        );
    }

    public function updateStatus(UpdateOrderStatusRequest $request, string $id): JsonResponse
    {
        $status = (string) $request->input('status');
        $comment = $request->input('comment');
        $actor = $request->user();

        $order = $this->orderService->updateOrderStatus($id, $status, $comment, $actor);

        return ResponseHelper::success(
            data: new OrderDetailResource($order),
            message: 'Order status updated successfully.'
        );
    }

    public function addNotes(AddOrderNoteRequest $request, string $id): JsonResponse
    {
        $notes = (string) $request->input('notes');

        $order = $this->orderService->addAdminNote($id, $notes);

        return ResponseHelper::success(
            data: new OrderDetailResource($order),
            message: 'Order notes updated successfully.'
        );
    }

    public function timeline(Request $request, string $id): JsonResponse
    {
        $timeline = $this->orderService->getOrderTimeline($id);

        return ResponseHelper::success(
            data: OrderStatusHistoryResource::collection($timeline),
            message: 'Order timeline retrieved successfully.'
        );
    }
}
