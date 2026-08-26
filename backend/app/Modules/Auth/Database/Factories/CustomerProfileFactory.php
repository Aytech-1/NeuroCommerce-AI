<?php

declare(strict_types=1);

namespace App\Modules\Auth\Database\Factories;

use App\Modules\Auth\Models\CustomerProfile;
use App\Modules\Auth\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * Class CustomerProfileFactory
 *
 * @extends Factory<CustomerProfile>
 */
class CustomerProfileFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = CustomerProfile::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'date_of_birth' => fake()->date('Y-m-d', '-18 years'),
            'gender' => fake()->randomElement(['male', 'female', 'other', 'prefer_not_to_say']),
            'company' => fake()->company(),
            'tax_id' => fake()->numerify('TAX-#####'),
            'loyalty_points' => fake()->numberBetween(0, 1000),
            'customer_group' => 'regular',
            'notes' => fake()->sentence(),
        ];
    }
}
