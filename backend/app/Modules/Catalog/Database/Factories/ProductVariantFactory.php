<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Database\Factories;

use App\Modules\Catalog\Models\Product;
use App\Modules\Catalog\Models\ProductVariant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ProductVariant>
 */
class ProductVariantFactory extends Factory
{
    protected $model = ProductVariant::class;

    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'sku' => 'VAR-' . strtoupper(fake()->unique()->bothify('??####')),
            'name' => fake()->words(2, true),
            'price' => fake()->randomFloat(4, 10, 300),
            'compare_at_price' => null,
            'cost_price' => fake()->randomFloat(4, 5, 100),
            'weight' => fake()->randomFloat(2, 0.1, 5),
            'barcode' => fake()->ean13(),
            'image_url' => fake()->imageUrl(400, 400, 'fashion'),
            'is_active' => true,
            'sort_order' => fake()->numberBetween(0, 10),
        ];
    }
}
