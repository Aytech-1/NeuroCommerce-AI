<?php

declare(strict_types=1);

namespace App\Modules\Payment\Controllers\Admin;

use App\Core\Helpers\PaginationHelper;
use App\Core\Helpers\ResponseHelper;
use App\Http\Controllers\Controller;
use App\Modules\Payment\DTOs\RefundDTO;
use App\Modules\Payment\Models\Payment;
use App\Modules\Payment\Requests\ProcessRefundRequest;
use App\Modules\Payment\Resources\PaymentResource;
use App\Modules\Payment\Resources\RefundResource;
use App\Modules\Payment\Services\PaymentService;
use App\Modules\Payment\Services\RefundService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Class PaymentController
 *
 * @package App\Modules\Payment\Controllers\Admin
 */
class PaymentController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private readonly PaymentService $paymentService,
        private readonly RefundService $refundService
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Payment::class);

        $perPage = PaginationHelper::getPerPage($request);
        $filters = $request->only(['status', 'gateway', 'search']);

        $paginator = $this->paymentService->paginatePayments($filters, $perPage);

        return ResponseHelper::paginated($paginator, PaymentResource::class);
    }

    public function show(string $id): JsonResponse
    {
        $payment = $this->paymentService->getPaymentById($id);
        $this->authorize('view', $payment);

        $payment->load(['transactions', 'refunds', 'order.user']);

        return ResponseHelper::success(
            data: new PaymentResource($payment),
            message: 'Payment retrieved successfully.'
        );
    }

    public function refund(string $id, ProcessRefundRequest $request): JsonResponse
    {
        $payment = $this->paymentService->getPaymentById($id);
        $this->authorize('refund', $payment);

        $dto = new RefundDTO(
            payment: $payment,
            amount: (float) $request->input('amount'),
            reason: $request->input('reason'),
            processedBy: (string) $request->user()?->id,
            idempotencyKey: $request->header('Idempotency-Key')
        );

        $refund = $this->refundService->processRefund($dto);

        return ResponseHelper::success(
            data: new RefundResource($refund),
            message: 'Refund processed successfully.'
        );
    }
}
