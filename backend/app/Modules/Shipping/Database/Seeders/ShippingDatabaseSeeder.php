<?php

declare(strict_types=1);

namespace App\Modules\Shipping\Database\Seeders;

use App\Modules\Shipping\Models\ShipRate;
use App\Modules\Shipping\Models\ShipZone;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * Class ShippingDatabaseSeeder
 *
 * @package App\Modules\Shipping\Database\Seeders
 */
class ShippingDatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Domestic Zone (US)
        /** @var ShipZone $domesticZone */
        $domesticZone = ShipZone::firstOrCreate(
            ['name' => 'Domestic (US)'],
            ['id' => (string) Str::uuid(), 'is_active' => true]
        );
        $domesticZone->syncCountries(['US']);

        // Rates for US
        ShipRate::firstOrCreate(
            ['zone_id' => $domesticZone->id, 'carrier' => 'mock_carrier', 'service_level' => 'Standard Ground'],
            [
                'id' => (string) Str::uuid(),
                'min_weight' => 0.0000,
                'max_weight' => 20.0000,
                'min_order_amount' => 0.0000,
                'rate' => 5.9900,
                'currency_code' => 'USD',
                'estimated_days_min' => 3,
                'estimated_days_max' => 5,
                'is_active' => true,
            ]
        );

        ShipRate::firstOrCreate(
            ['zone_id' => $domesticZone->id, 'carrier' => 'mock_carrier', 'service_level' => 'Express 2-Day'],
            [
                'id' => (string) Str::uuid(),
                'min_weight' => 0.0000,
                'max_weight' => 20.0000,
                'min_order_amount' => 0.0000,
                'rate' => 14.9900,
                'currency_code' => 'USD',
                'estimated_days_min' => 1,
                'estimated_days_max' => 2,
                'is_active' => true,
            ]
        );

        // 2. North America (CA, MX)
        /** @var ShipZone $naZone */
        $naZone = ShipZone::firstOrCreate(
            ['name' => 'North America (CA, MX)'],
            ['id' => (string) Str::uuid(), 'is_active' => true]
        );
        $naZone->syncCountries(['CA', 'MX']);

        ShipRate::firstOrCreate(
            ['zone_id' => $naZone->id, 'carrier' => 'mock_carrier', 'service_level' => 'International Standard'],
            [
                'id' => (string) Str::uuid(),
                'min_weight' => 0.0000,
                'max_weight' => 30.0000,
                'min_order_amount' => 0.0000,
                'rate' => 19.9900,
                'currency_code' => 'USD',
                'estimated_days_min' => 5,
                'estimated_days_max' => 10,
                'is_active' => true,
            ]
        );

        // 3. Europe (GB, DE, FR, IT, ES)
        /** @var ShipZone $europeZone */
        $europeZone = ShipZone::firstOrCreate(
            ['name' => 'Europe Zone'],
            ['id' => (string) Str::uuid(), 'is_active' => true]
        );
        $europeZone->syncCountries(['GB', 'DE', 'FR', 'IT', 'ES', 'NL']);

        ShipRate::firstOrCreate(
            ['zone_id' => $europeZone->id, 'carrier' => 'mock_carrier', 'service_level' => 'Global Priority'],
            [
                'id' => (string) Str::uuid(),
                'min_weight' => 0.0000,
                'max_weight' => 30.0000,
                'min_order_amount' => 0.0000,
                'rate' => 29.9900,
                'currency_code' => 'USD',
                'estimated_days_min' => 4,
                'estimated_days_max' => 7,
                'is_active' => true,
            ]
        );
    }
}
