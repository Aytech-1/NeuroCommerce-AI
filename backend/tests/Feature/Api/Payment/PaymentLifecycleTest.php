<?php

declare(strict_types=1);

namespace Tests\Feature\Api\Payment;

use App\Modules\Auth\Models\User;
use App\Modules\Order\Enums\OrderStatus;
use App\Modules\Order\Models\Order;
use App\Modules\Payment\DTOs\PaymentIntentDTO;
use App\Modules\Payment\Enums\PaymentStatus;
use App\Modules\Payment\Enums\TransactionStatus;
use App\Modules\Payment\Enums\TransactionType;
use App\Modules\Payment\Models\Payment;
use App\Modules\Payment\Models\PaymentTransaction;
use App\Modules\Payment\Services\PaymentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PaymentLifecycleTest extends TestCase
{
    use RefreshDatabase;

    private User $customer;
    private Order $order;
    private PaymentService $paymentService;

    protected function setUp(): void
    {
        parent::setUp();

        $this->customer = User::factory()->create();
        $this->order = Order::factory()->create([
            'user_id' => $this->customer->id,
            'status' => OrderStatus::PENDING,
            'total_amount' => 150.00,
            'currency_code' => 'USD',
        ]);

        $this->paymentService = app(PaymentService::class);
    }

    public function test_successful_payment_processing_creates_payment_and_transaction(): void
    {
        $dto = new PaymentIntentDTO(
            order: $this->order,
            amount: 150.00,
            currency: 'USD',
            paymentMethod: 'mock_stripe',
            paymentToken: 'tok_visa'
        );

        $result = $this->paymentService->processOrderPayment($dto);

        $this->assertTrue($result->isSuccess);
        $this->assertNotNull($result->gatewayPaymentId);

        $this->assertDatabaseHas('payments', [
            'order_id' => $this->order->id,
            'status' => PaymentStatus::COMPLETED->value,
            'amount' => 150.00,
            'currency_code' => 'USD',
        ]);

        $this->assertDatabaseHas('pay_transactions', [
            'type' => TransactionType::CAPTURE->value,
            'status' => TransactionStatus::SUCCESS->value,
            'amount' => 150.00,
        ]);
    }

    public function test_failed_payment_records_failure_and_failed_transaction(): void
    {
        $dto = new PaymentIntentDTO(
            order: $this->order,
            amount: 150.00,
            currency: 'USD',
            paymentMethod: 'mock_stripe',
            paymentToken: 'tok_charge_declined'
        );

        $result = $this->paymentService->processOrderPayment($dto);

        $this->assertFalse($result->isSuccess);
        $this->assertEquals('Your card was declined.', $result->errorMessage);

        $this->assertDatabaseHas('payments', [
            'order_id' => $this->order->id,
            'status' => PaymentStatus::FAILED->value,
        ]);

        $this->assertDatabaseHas('pay_transactions', [
            'type' => TransactionType::CAPTURE->value,
            'status' => TransactionStatus::FAILED->value,
        ]);
    }

    public function test_payment_verification_updates_pending_payment_to_completed(): void
    {
        $payment = Payment::factory()->create([
            'order_id' => $this->order->id,
            'gateway' => 'mock_stripe',
            'gateway_payment_id' => 'mock_pi_verify_test',
            'status' => PaymentStatus::PENDING,
            'amount' => 150.00,
        ]);

        $verifiedPayment = $this->paymentService->verifyPayment('mock_stripe', 'mock_pi_verify_test');

        $this->assertEquals(PaymentStatus::COMPLETED, $verifiedPayment->status);
        $this->assertNotNull($verifiedPayment->paid_at);
    }
}
