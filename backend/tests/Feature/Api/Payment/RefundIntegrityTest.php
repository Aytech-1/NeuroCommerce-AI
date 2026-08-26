<?php

declare(strict_types=1);

namespace Tests\Feature\Api\Payment;

use App\Modules\Auth\Models\User;
use App\Modules\Order\Models\Order;
use App\Modules\Payment\Enums\PaymentStatus;
use App\Modules\Payment\Enums\RefundStatus;
use App\Modules\Payment\Models\Payment;
use App\Modules\Payment\Models\Refund;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class RefundIntegrityTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private Payment $payment;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(DatabaseSeeder::class);

        $this->admin = User::where('email', 'admin@neurocommerce.test')->first() ?? User::factory()->create();
        $this->admin->givePermissionTo('payment.view', 'payment.refund');

        $order = Order::factory()->create(['total_amount' => 100.00]);
        $this->payment = Payment::factory()->create([
            'order_id' => $order->id,
            'gateway' => 'mock_stripe',
            'amount' => 100.00,
            'status' => PaymentStatus::COMPLETED,
        ]);
    }

    public function test_admin_can_process_partial_refund(): void
    {
        Sanctum::actingAs($this->admin);

        $response = $this->postJson("/api/v1/admin/payments/{$this->payment->id}/refund", [
            'amount' => 40.00,
            'reason' => 'Customer requested partial refund',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.amount', 40)
            ->assertJsonPath('data.status', RefundStatus::PROCESSED->value);

        $this->assertEquals(PaymentStatus::PARTIALLY_REFUNDED, $this->payment->fresh()->status);
        $this->assertEquals(60.00, $this->payment->fresh()->getRemainingRefundableAmount());
    }

    public function test_full_refund_transitions_payment_to_refunded(): void
    {
        Sanctum::actingAs($this->admin);

        $response = $this->postJson("/api/v1/admin/payments/{$this->payment->id}/refund", [
            'amount' => 100.00,
            'reason' => 'Full refund returned goods',
        ]);

        $response->assertStatus(200);
        $this->assertEquals(PaymentStatus::REFUNDED, $this->payment->fresh()->status);
        $this->assertEquals(0.00, $this->payment->fresh()->getRemainingRefundableAmount());
    }

    public function test_refund_exceeding_payment_amount_is_strictly_rejected(): void
    {
        Sanctum::actingAs($this->admin);

        $response = $this->postJson("/api/v1/admin/payments/{$this->payment->id}/refund", [
            'amount' => 150.00,
            'reason' => 'Excessive refund attempt',
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('success', false)
            ->assertJsonPath('code', 'REFUND_EXCEEDS_PAYMENT');
    }

    public function test_admin_can_list_refunds_with_pagination(): void
    {
        Sanctum::actingAs($this->admin);

        Refund::factory()->count(3)->create([
            'payment_id' => $this->payment->id,
            'order_id' => $this->payment->order_id,
        ]);

        $response = $this->getJson('/api/v1/admin/refunds');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'amount', 'reason', 'status', 'created_at'],
                ],
                'meta' => ['current_page', 'per_page', 'total'],
            ]);
    }
}
