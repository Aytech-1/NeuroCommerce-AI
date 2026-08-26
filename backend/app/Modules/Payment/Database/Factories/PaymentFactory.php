<?php

declare(strict_types=1);

namespace App\Modules\Payment\Database\Factories;

use App\Modules\Order\Models\Order;
use App\Modules\Payment\Enums\PaymentStatus;
use App\Modules\Payment\Models\Payment;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Payment>
 */
class PaymentFactory extends Factory
{
    protected $model = Payment::class;

    public function definition(): array
    {
        return [
            'order_id' => Order::factory(),
            'gateway' => 'stripe',
            'gateway_payment_id' => 'pi_' . Str::random(24),
            'method' => 'credit_card',
            'status' => PaymentStatus::COMPLETED,
            'amount' => $this->faker->randomFloat(4, 10, 500),
            'currency_code' => 'USD',
            'card_last_four' => '4242',
            'card_brand' => 'visa',
            'metadata' => ['integration' => 'automated_test'],
            'paid_at' => now(),
            'failed_at' => null,
            'failure_reason' => null,
        ];
    }

    public function pending(): static
    {
        return $this->state(fn () => [
            'status' => PaymentStatus::PENDING,
            'paid_at' => null,
        ]);
    }

    public function failed(): static
    {
        return $this->state(fn () => [
            'status' => PaymentStatus::FAILED,
            'paid_at' => null,
            'failed_at' => now(),
            'failure_reason' => 'Card declined',
        ]);
    }
}
