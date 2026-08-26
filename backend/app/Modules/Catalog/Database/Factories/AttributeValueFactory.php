<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Database\Factories;

use App\Modules\Catalog\Models\AttributeValue;
use App\Modules\Catalog\Models\ProductAttribute;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<AttributeValue>
 */
class AttributeValueFactory extends Factory
{
    protected $model = AttributeValue::class;

    public function definition(): array
    {
        $val = fake()->unique()->word();

        return [
            'attribute_id' => ProductAttribute::factory(),
            'value' => ucfirst($val),
            'slug' => Str::slug($val),
            'color_hex' => fake()->hexColor(),
            'sort_order' => 0,
        ];
    }
}
