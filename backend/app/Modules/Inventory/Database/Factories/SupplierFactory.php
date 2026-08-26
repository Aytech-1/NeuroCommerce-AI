<?php

declare(strict_types=1);

namespace App\Modules\Inventory\Database\Factories;

use App\Modules\Auth\Models\Address;
use App\Modules\Inventory\Models\Supplier;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * Class SupplierFactory
 *
 * @extends Factory<Supplier>
 */
class SupplierFactory extends Factory
{
    protected $model = Supplier::class;

    public function definition(): array
    {
        $company = fake()->company();
        $code = 'SUP-' . strtoupper(fake()->lexify('????'));

        return [
            'name' => $company,
            'code' => $code,
            'contact_name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'phone' => fake()->phoneNumber(),
            'website' => fake()->url(),
            'address_id' => Address::factory(),
            'is_active' => true,
        ];
    }
}
