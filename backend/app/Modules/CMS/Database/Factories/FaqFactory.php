<?php

declare(strict_types=1);

namespace App\Modules\CMS\Database\Factories;

use App\Modules\CMS\Models\Faq;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Faq>
 */
class FaqFactory extends Factory
{
    protected $model = Faq::class;

    public function definition(): array
    {
        return [
            'question' => fake()->sentence() . '?',
            'answer' => fake()->paragraph(),
            'category' => fake()->randomElement(['Orders', 'Shipping', 'Returns', 'Payment']),
            'sort_order' => fake()->numberBetween(0, 10),
            'is_active' => true,
        ];
    }
}
