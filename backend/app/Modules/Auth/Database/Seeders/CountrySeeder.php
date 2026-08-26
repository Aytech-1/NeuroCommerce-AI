<?php

declare(strict_types=1);

namespace App\Modules\Auth\Database\Seeders;

use App\Modules\Core\Models\Country;
use Illuminate\Database\Seeder;

/**
 * Class CountrySeeder
 *
 * @package App\Modules\Auth\Database\Seeders
 */
class CountrySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $countries = [
            ['code' => 'US', 'name' => 'United States', 'iso3' => 'USA', 'numeric_code' => '840', 'phone_code' => '+1', 'currency_code' => 'USD', 'is_active' => true],
            ['code' => 'GB', 'name' => 'United Kingdom', 'iso3' => 'GBR', 'numeric_code' => '826', 'phone_code' => '+44', 'currency_code' => 'GBP', 'is_active' => true],
            ['code' => 'CA', 'name' => 'Canada', 'iso3' => 'CAN', 'numeric_code' => '124', 'phone_code' => '+1', 'currency_code' => 'CAD', 'is_active' => true],
            ['code' => 'NG', 'name' => 'Nigeria', 'iso3' => 'NGA', 'numeric_code' => '566', 'phone_code' => '+234', 'currency_code' => 'NGN', 'is_active' => true],
            ['code' => 'DE', 'name' => 'Germany', 'iso3' => 'DEU', 'numeric_code' => '276', 'phone_code' => '+49', 'currency_code' => 'EUR', 'is_active' => true],
            ['code' => 'FR', 'name' => 'France', 'iso3' => 'FRA', 'numeric_code' => '250', 'phone_code' => '+33', 'currency_code' => 'EUR', 'is_active' => true],
            ['code' => 'AU', 'name' => 'Australia', 'iso3' => 'AUS', 'numeric_code' => '036', 'phone_code' => '+61', 'currency_code' => 'AUD', 'is_active' => true],
        ];

        foreach ($countries as $country) {
            Country::updateOrCreate(['code' => $country['code']], $country);
        }
    }
}
