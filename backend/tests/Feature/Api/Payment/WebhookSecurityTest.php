<?php

declare(strict_types=1);

namespace Tests\Feature\Api\Payment;

use App\Modules\Order\Models\Order;
use App\Modules\Payment\Enums\PaymentStatus;
use App\Modules\Payment\Models\Payment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class WebhookSecurityTest extends TestCase
{
    use RefreshDatabase;

    private string $webhookSecret = 'mock_secret_key';

    protected function setUp(): void
    {
        parent::setUp();
        config(['payment.gateways.mock.webhook_secret' => $this->webhookSecret]);
    }

    public function test_valid_webhook_signature_processes_successfully(): void
    {
        $order = Order::factory()->create();
        $payment = Payment::factory()->pending()->create([
            'order_id' => $order->id,
            'gateway' => 'mock_stripe',
            'gateway_payment_id' => 'pi_webhook_success_123',
        ]);

        $payload = json_encode([
            'id' => 'evt_test_success_123',
            'type' => 'payment_intent.succeeded',
            'gateway_payment_id' => 'pi_webhook_success_123',
            'amount' => 100.00,
            'created' => time(),
        ]);

        $signature = hash_hmac('sha256', $payload, $this->webhookSecret);

        $response = $this->postJson('/api/v1/webhooks/mock_stripe', json_decode($payload, true), [
            'X-Webhook-Signature' => $signature,
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', 'success');

        $this->assertEquals(PaymentStatus::COMPLETED, $payment->fresh()->status);
    }

    public function test_invalid_webhook_signature_is_rejected_with_400(): void
    {
        $payload = json_encode([
            'id' => 'evt_invalid_sig',
            'type' => 'payment_intent.succeeded',
            'created' => time(),
        ]);

        $response = $this->postJson('/api/v1/webhooks/mock_stripe', json_decode($payload, true), [
            'X-Webhook-Signature' => 'invalid_signature_hash',
        ]);

        $response->assertStatus(400)
            ->assertJsonPath('success', false)
            ->assertJsonPath('code', 'INVALID_WEBHOOK_SIGNATURE');
    }

    public function test_expired_webhook_timestamp_is_rejected_as_replay_attack(): void
    {
        $payload = json_encode([
            'id' => 'evt_expired_timestamp',
            'type' => 'payment_intent.succeeded',
            'created' => time() - 600, // 10 minutes ago
        ]);

        $signature = hash_hmac('sha256', $payload, $this->webhookSecret);

        $response = $this->postJson('/api/v1/webhooks/mock_stripe', json_decode($payload, true), [
            'X-Webhook-Signature' => $signature,
        ]);

        $response->assertStatus(400)
            ->assertJsonPath('success', false)
            ->assertJsonPath('code', 'WEBHOOK_TIMESTAMP_EXPIRED');
    }

    public function test_duplicate_webhook_is_handled_idempotently_without_error(): void
    {
        $order = Order::factory()->create();
        Payment::factory()->pending()->create([
            'order_id' => $order->id,
            'gateway' => 'mock_stripe',
            'gateway_payment_id' => 'pi_duplicate_test',
        ]);

        $payload = json_encode([
            'id' => 'evt_duplicate_id_999',
            'type' => 'payment_intent.succeeded',
            'gateway_payment_id' => 'pi_duplicate_test',
            'created' => time(),
        ]);

        $signature = hash_hmac('sha256', $payload, $this->webhookSecret);

        // First call
        $this->postJson('/api/v1/webhooks/mock_stripe', json_decode($payload, true), [
            'X-Webhook-Signature' => $signature,
        ])->assertStatus(200);

        // Second call (Duplicate)
        $response = $this->postJson('/api/v1/webhooks/mock_stripe', json_decode($payload, true), [
            'X-Webhook-Signature' => $signature,
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'duplicate');
    }
}
