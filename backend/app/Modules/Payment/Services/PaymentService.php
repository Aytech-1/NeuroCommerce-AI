<?php

declare(strict_types=1);

namespace App\Modules\Payment\Services;

use App\Core\Abstracts\AbstractService;
use App\Core\Exceptions\BusinessRuleException;
use App\Core\Exceptions\EntityNotFoundException;
use App\Modules\Payment\Contracts\PaymentRepositoryInterface;
use App\Modules\Payment\Contracts\PaymentTransactionRepositoryInterface;
use App\Modules\Payment\DTOs\PaymentIntentDTO;
use App\Modules\Payment\DTOs\PaymentResultDTO;
use App\Modules\Payment\Enums\PaymentStatus;
use App\Modules\Payment\Enums\TransactionStatus;
use App\Modules\Payment\Enums\TransactionType;
use App\Modules\Payment\Events\PaymentCompleted;
use App\Modules\Payment\Events\PaymentFailed;
use App\Modules\Payment\Models\Payment;
use App\Modules\Payment\Services\Gateways\PaymentGatewayManager;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * Class PaymentService
 *
 * @package App\Modules\Payment\Services
 */
class PaymentService extends AbstractService
{
    public function __construct(
        private readonly PaymentRepositoryInterface $paymentRepository,
        private readonly PaymentTransactionRepositoryInterface $transactionRepository,
        private readonly PaymentGatewayManager $gatewayManager
    ) {
    }

    public function processOrderPayment(PaymentIntentDTO $dto): PaymentResultDTO
    {
        $gateway = $this->gatewayManager->gateway($dto->paymentMethod);
        $result = $gateway->chargeOrAuthorize($dto);

        return $this->executeInTransaction(function () use ($dto, $gateway, $result) {
            $paymentStatus = $result->isSuccess ? PaymentStatus::COMPLETED : PaymentStatus::FAILED;

            /** @var Payment $payment */
            $payment = $this->paymentRepository->createPayment([
                'order_id' => $dto->order->id,
                'gateway' => $gateway->getGatewayName(),
                'gateway_payment_id' => $result->gatewayPaymentId,
                'method' => $dto->paymentMethod,
                'status' => $paymentStatus->value,
                'amount' => $dto->amount,
                'currency_code' => $dto->currency,
                'card_last_four' => $result->cardLastFour,
                'card_brand' => $result->cardBrand,
                'metadata' => $dto->metadata,
                'paid_at' => $result->isSuccess ? Carbon::now() : null,
                'failed_at' => !$result->isSuccess ? Carbon::now() : null,
                'failure_reason' => $result->errorMessage,
            ]);

            // Append transaction entry
            $this->transactionRepository->recordTransaction([
                'payment_id' => $payment->id,
                'type' => TransactionType::CAPTURE->value,
                'amount' => $dto->amount,
                'currency_code' => $dto->currency,
                'gateway_transaction_id' => $result->transactionId ?? $result->gatewayPaymentId,
                'status' => $result->isSuccess ? TransactionStatus::SUCCESS->value : TransactionStatus::FAILED->value,
                'response_data' => $result->rawResponse,
            ]);

            if ($result->isSuccess) {
                event(new PaymentCompleted($payment));
            } else {
                event(new PaymentFailed($payment, $result->errorMessage ?? 'Payment failed'));
            }

            return $result;
        });
    }

    public function verifyPayment(string $gateway, string $gatewayPaymentId): Payment
    {
        $payment = $this->paymentRepository->findByGatewayPaymentId($gateway, $gatewayPaymentId);
        if (!$payment) {
            throw new EntityNotFoundException('Payment with gateway ID ' . $gatewayPaymentId . ' not found.');
        }

        $gatewayInstance = $this->gatewayManager->gateway($gateway);
        $result = $gatewayInstance->verifyPayment($gatewayPaymentId);

        if ($result->isSuccess && $payment->status !== PaymentStatus::COMPLETED) {
            $payment->update([
                'status' => PaymentStatus::COMPLETED,
                'paid_at' => Carbon::now(),
            ]);

            $this->transactionRepository->recordTransaction([
                'payment_id' => $payment->id,
                'type' => TransactionType::CAPTURE->value,
                'amount' => $payment->amount,
                'currency_code' => $payment->currency_code,
                'gateway_transaction_id' => $result->transactionId,
                'status' => TransactionStatus::SUCCESS->value,
                'response_data' => $result->rawResponse,
            ]);

            event(new PaymentCompleted($payment));
        }

        return $payment->fresh(['transactions', 'refunds', 'order']);
    }

    public function getPaymentById(string $id): Payment
    {
        /** @var Payment|null $payment */
        $payment = $this->paymentRepository->findById($id);
        if (!$payment) {
            throw new EntityNotFoundException('Payment with ID ' . $id . ' not found.');
        }

        return $payment;
    }

    public function paginatePayments(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        return $this->paymentRepository->paginateForAdmin($filters, $perPage);
    }
}
