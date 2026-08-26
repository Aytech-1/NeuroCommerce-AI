<?php

declare(strict_types=1);

namespace App\Modules\Inventory\Database\Seeders;

use App\Modules\Auth\Models\Address;
use App\Modules\Inventory\Models\Warehouse;
use Illuminate\Database\Seeder;

/**
 * Class WarehouseSeeder
 *
 * @package App\Modules\Inventory\Database\Seeders
 */
class WarehouseSeeder extends Seeder
{
    public function run(): void
    {
        $address = Address::first() ?? Address::factory()->create();

        $warehouses = [
            [
                'name' => 'Main Lagos Hub',
                'code' => 'WH-LOS-01',
                'address_id' => $address->id,
                'is_active' => true,
                'is_default' => true,
                'priority' => 0,
            ],
            [
                'name' => 'Abuja Regional Depot',
                'code' => 'WH-ABJ-02',
                'address_id' => $address->id,
                'is_active' => true,
                'is_default' => false,
                'priority' => 1,
            ],
            [
                'name' => 'Port Harcourt Warehouse',
                'code' => 'WH-PHC-03',
                'address_id' => $address->id,
                'is_active' => true,
                'is_default' => false,
                'priority' => 2,
            ],
        ];

        foreach ($warehouses as $wh) {
            Warehouse::updateOrCreate(['code' => $wh['code']], $wh);
        }
    }
}
