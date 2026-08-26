<?php

declare(strict_types=1);

namespace App\Modules\CMS\Database\Factories;

use App\Modules\CMS\Models\Banner;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Banner>
 */
class BannerFactory extends Factory
{
    protected $model = Banner::class;

    public function definition(): array
    {
        return [
            'title' => fake()->sentence(3),
            'subtitle' => fake()->sentence(5),
            'image_url' => fake()->imageUrl(1920, 600),
            'link_url' => '/products',
            'button_text' => 'Shop Now',
            'position' => 'hero',
            'sort_order' => fake()->numberBetween(0, 10),
            'is_active' => true,
            'starts_at' => now()->subDay(),
            'expires_at' => now()->addMonths(3),
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
