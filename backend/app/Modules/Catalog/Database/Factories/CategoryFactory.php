<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Database\Factories;

use App\Modules\Catalog\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Category>
 */
class CategoryFactory extends Factory
{
    protected $model = Category::class;

    public function definition(): array
    {
        $name = fake()->unique()->words(2, true);

        return [
            'name' => ucfirst($name),
            'slug' => Str::slug($name),
            'description' => fake()->sentence(),
            'image_url' => fake()->imageUrl(640, 480, 'fashion'),
            'sort_order' => fake()->numberBetween(0, 50),
            'depth' => 0,
            'lft' => 0,
            'rgt' => 0,
            'is_active' => true,
            'meta_title' => ucfirst($name),
            'meta_description' => fake()->sentence(),
        ];
    }
}
