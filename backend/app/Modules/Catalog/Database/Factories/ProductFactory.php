<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Database\Factories;

use App\Modules\Catalog\Enums\ProductStatus;
use App\Modules\Catalog\Enums\ProductVisibility;
use App\Modules\Catalog\Enums\WeightUnit;
use App\Modules\Catalog\Models\Brand;
use App\Modules\Catalog\Models\Category;
use App\Modules\Catalog\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        $name = fake()->unique()->words(3, true);
        $basePrice = fake()->randomFloat(4, 10, 500);

        return [
            'sku' => 'SKU-' . strtoupper(fake()->unique()->bothify('??###')),
            'slug' => Str::slug($name) . '-' . fake()->unique()->numberBetween(100, 9999),
            'name' => ucfirst($name),
            'description' => fake()->paragraphs(3, true),
            'short_description' => fake()->sentence(),
            'category_id' => Category::factory(),
            'brand_id' => Brand::factory(),
            'base_price' => $basePrice,
            'compare_at_price' => fake()->boolean(40) ? $basePrice * 1.25 : null,
            'cost_price' => $basePrice * 0.5,
            'currency_code' => 'USD',
            'tax_class' => 'standard',
            'weight' => fake()->randomFloat(2, 0.1, 10),
            'weight_unit' => WeightUnit::KG,
            'length' => fake()->randomFloat(2, 5, 50),
            'width' => fake()->randomFloat(2, 5, 50),
            'height' => fake()->randomFloat(2, 5, 50),
            'is_digital' => false,
            'is_featured' => fake()->boolean(20),
            'is_active' => true,
            'status' => ProductStatus::ACTIVE,
            'visibility' => ProductVisibility::VISIBLE,
            'avg_rating' => fake()->randomFloat(2, 3, 5),
            'review_count' => fake()->numberBetween(0, 100),
            'total_sold' => fake()->numberBetween(0, 500),
            'meta_title' => ucfirst($name),
            'meta_description' => fake()->sentence(),
            'published_at' => now(),
        ];
    }

    public function draft(): static
    {
        return $this->state(fn () => [
            'status' => ProductStatus::DRAFT,
        ]);
    }
}
