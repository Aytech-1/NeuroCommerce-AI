<?php

declare(strict_types=1);

namespace App\Modules\Payment\Services;

use App\Core\Abstracts\AbstractService;
use App\Core\Exceptions\BusinessRuleException;
use App\Core\Exceptions\EntityNotFoundException;
use App\Modules\Payment\Contracts\PaymentRepositoryInterface;
use App\Modules\Payment\Contracts\PaymentTransactionRepositoryInterface;
use App\Modules\Payment\Contracts\RefundRepositoryInterface;
use App\Modules\Payment\DTOs\RefundDTO;
use App\Modules\Payment\Enums\PaymentStatus;
use App\Modules\Payment\Enums\RefundStatus;
use App\Modules\Payment\Enums\TransactionStatus;
use App\Modules\Payment\Enums\TransactionType;
use App\Modules\Payment\Events\RefundProcessed;
use App\Modules\Payment\Models\Payment;
use App\Modules\Payment\Models\Refund;
use App\Modules\Payment\Services\Gateways\PaymentGatewayManager;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * Class RefundService
 *
 * @package App\Modules\Payment\Services
 */
class RefundService extends AbstractService
{
    public function __construct(
        private readonly PaymentRepositoryInterface $paymentRepository,
        private readonly RefundRepositoryInterface $refundRepository,
        private readonly PaymentTransactionRepositoryInterface $transactionRepository,
        private readonly PaymentGatewayManager $gatewayManager
    ) {
    }

    public function processRefund(RefundDTO $dto): Refund
    {
        return DB::transaction(function () use ($dto) {
            /** @var Payment|null $payment */
            $payment = Payment::query()->lockForUpdate()->find($dto->payment->id);
            if (!$payment) {
                throw new EntityNotFoundException('Payment not found.');
            }

            if (!$payment->status->isRefundable()) {
                throw new BusinessRuleException(
                    "Payment with status '{$payment->status->value}' cannot be refunded.",
                    422,
                    'PAYMENT_NOT_REFUNDABLE'
                );
            }

            if ($dto->amount <= 0) {
                throw new BusinessRuleException(
                    'Refund amount must be greater than zero.',
                    422,
                    'INVALID_REFUND_AMOUNT'
                );
            }

            $currentRefundedTotal = (float) Refund::query()
                ->where('payment_id', $payment->id)
                ->whereIn('status', [RefundStatus::APPROVED->value, RefundStatus::PROCESSED->value])
                ->lockForUpdate()
                ->sum('amount');

            $newTotal = round($currentRefundedTotal + $dto->amount, 4);
            $paymentTotal = round((float) $payment->amount, 4);

            if ($newTotal > $paymentTotal) {
                throw new BusinessRuleException(
                    "Requested refund amount ({$dto->amount}) exceeds maximum refundable balance (" . ($paymentTotal - $currentRefundedTotal) . ').',
                    422,
                    'REFUND_EXCEEDS_PAYMENT'
                );
            }

            $gateway = $this->gatewayManager->gateway($payment->gateway);
            $result = $gateway->refundPayment($dto);

            if (!$result->isSuccess) {
                throw new BusinessRuleException(
                    $result->errorMessage ?? 'Gateway refund processing failed.',
                    422,
                    'GATEWAY_REFUND_FAILED'
                );
            }

            /** @var Refund $refund */
            $refund = $this->refundRepository->createRefund([
                'payment_id' => $payment->id,
                'order_id' => $payment->order_id,
                'amount' => $dto->amount,
                'reason' => $dto->reason,
                'status' => RefundStatus::PROCESSED->value,
                'gateway_refund_id' => $result->gatewayRefundId,
                'processed_by' => $dto->processedBy,
                'processed_at' => Carbon::now(),
            ]);

            // Append transaction entry
            $this->transactionRepository->recordTransaction([
                'payment_id' => $payment->id,
                'type' => TransactionType::REFUND->value,
                'amount' => $dto->amount,
                'currency_code' => $payment->currency_code,
                'gateway_transaction_id' => $result->gatewayRefundId,
                'status' => TransactionStatus::SUCCESS->value,
                'response_data' => $result->rawResponse,
            ]);

            // Update payment state
            if ($newTotal >= $paymentTotal) {
                $payment->update(['status' => PaymentStatus::REFUNDED]);
            } else {
                $payment->update(['status' => PaymentStatus::PARTIALLY_REFUNDED]);
            }

            event(new RefundProcessed($refund));

            return $refund->fresh(['payment', 'order', 'processor']);
        });
    }

    public function paginateRefunds(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        return $this->refundRepository->paginateForAdmin($filters, $perPage);
    }
}
