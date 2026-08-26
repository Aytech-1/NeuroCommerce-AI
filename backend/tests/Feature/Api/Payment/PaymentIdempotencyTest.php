<?php

declare(strict_types=1);

namespace Tests\Feature\Api\Payment;

use App\Modules\Auth\Models\User;
use App\Modules\Payment\Enums\PaymentStatus;
use App\Modules\Payment\Models\Payment;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PaymentIdempotencyTest extends TestCase
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

        $this->payment = Payment::factory()->create([
            'amount' => 100.00,
            'status' => PaymentStatus::COMPLETED,
        ]);
    }

    public function test_admin_can_view_payments_list(): void
    {
        Sanctum::actingAs($this->admin);

        $response = $this->getJson('/api/v1/admin/payments');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'amount', 'currency_code', 'status', 'gateway'],
                ],
                'meta' => ['current_page', 'per_page', 'total'],
            ]);
    }
}
