<?php

declare(strict_types=1);

namespace Tests\Feature\Api\Payment;

use App\Modules\Auth\Models\User;
use App\Modules\Payment\Models\Payment;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PaymentSecurityTest extends TestCase
{
    use RefreshDatabase;

    private User $customer;
    private User $admin;
    private Payment $payment;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(DatabaseSeeder::class);

        $this->customer = User::factory()->create();
        $this->admin = User::where('email', 'admin@neurocommerce.test')->first() ?? User::factory()->create();
        $this->admin->givePermissionTo('payment.view', 'payment.refund');

        $this->payment = Payment::factory()->create();
    }

    public function test_unauthenticated_request_to_admin_payments_returns_401(): void
    {
        $this->getJson('/api/v1/admin/payments')
            ->assertStatus(401);
    }

    public function test_customer_without_permission_cannot_access_admin_payments_403(): void
    {
        Sanctum::actingAs($this->customer);

        $this->getJson('/api/v1/admin/payments')
            ->assertStatus(403);
    }

    public function test_sensitive_card_details_are_not_exposed_in_api_responses(): void
    {
        Sanctum::actingAs($this->admin);

        $response = $this->getJson("/api/v1/admin/payments/{$this->payment->id}");

        $response->assertStatus(200);

        $data = $response->json('data');

        $this->assertArrayNotHasKey('card_number', $data);
        $this->assertArrayNotHasKey('cvv', $data);
        $this->assertArrayNotHasKey('pin', $data);
        $this->assertArrayHasKey('card_last_four', $data);
    }
}
