<?php

declare(strict_types=1);

namespace App\Modules\Payment\Database\Factories;

use App\Modules\Auth\Models\User;
use App\Modules\Order\Models\Order;
use App\Modules\Payment\Enums\RefundStatus;
use App\Modules\Payment\Models\Payment;
use App\Modules\Payment\Models\Refund;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Refund>
 */
class RefundFactory extends Factory
{
    protected $model = Refund::class;

    public function definition(): array
    {
        return [
            'payment_id' => Payment::factory(),
            'order_id' => fn (array $attributes) => Payment::find($attributes['payment_id'])?->order_id ?? Order::factory(),
            'amount' => 25.00,
            'reason' => 'Customer request',
            'status' => RefundStatus::PROCESSED,
            'gateway_refund_id' => 're_' . Str::random(24),
            'processed_by' => User::factory(),
            'processed_at' => now(),
        ];
    }
}
