<?php

declare(strict_types=1);

namespace App\Modules\Order\Database\Factories;

use App\Modules\Catalog\Models\Product;
use App\Modules\Order\Models\Order;
use App\Modules\Order\Models\OrderItem;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * Class OrderItemFactory
 *
 * @extends Factory<OrderItem>
 */
class OrderItemFactory extends Factory
{
    protected $model = OrderItem::class;

    public function definition(): array
    {
        $quantity = $this->faker->numberBetween(1, 4);
        $unitPrice = $this->faker->randomFloat(2, 20, 150);
        $lineTotal = $unitPrice * $quantity;

        return [
            'id' => (string) Str::uuid(),
            'order_id' => Order::factory(),
            'product_id' => Product::factory(),
            'variant_id' => null,
            'product_name' => $this->faker->words(3, true),
            'product_sku' => 'SKU-' . strtoupper(Str::random(8)),
            'variant_name' => null,
            'quantity' => $quantity,
            'unit_price' => $unitPrice,
            'tax_amount' => 0.00,
            'discount_amount' => 0.00,
            'line_total' => $lineTotal,
        ];
    }
}
