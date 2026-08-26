<?php

declare(strict_types=1);

namespace App\Modules\Order\Database\Factories;

use App\Modules\Auth\Models\Address;
use App\Modules\Auth\Models\User;
use App\Modules\Order\Enums\OrderStatus;
use App\Modules\Order\Models\Order;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * Class OrderFactory
 *
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    protected $model = Order::class;

    public function definition(): array
    {
        $subtotal = $this->faker->randomFloat(2, 50, 500);
        $tax = round($subtotal * 0.08, 2);
        $shipping = 10.00;
        $total = $subtotal + $tax + $shipping;

        return [
            'id' => (string) Str::uuid(),
            'order_number' => 'NC-' . date('Ymd') . '-' . strtoupper(Str::random(6)),
            'user_id' => User::factory(),
            'status' => OrderStatus::PAID,
            'currency_code' => 'USD',
            'subtotal' => $subtotal,
            'tax_amount' => $tax,
            'shipping_amount' => $shipping,
            'discount_amount' => 0.00,
            'total_amount' => $total,
            'item_count' => 2,
            'coupon_id' => null,
            'coupon_code' => null,
            'billing_address_id' => Address::factory(),
            'shipping_address_id' => Address::factory(),
            'shipping_method' => 'Standard Delivery',
            'payment_method' => 'stripe',
            'notes' => $this->faker->sentence(),
            'admin_notes' => null,
            'ip_address' => $this->faker->ipv4(),
            'user_agent' => $this->faker->userAgent(),
            'placed_at' => now(),
            'paid_at' => now(),
        ];
    }
}
