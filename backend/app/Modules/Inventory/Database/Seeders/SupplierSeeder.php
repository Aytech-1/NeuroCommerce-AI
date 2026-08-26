<?php

declare(strict_types=1);

namespace App\Modules\Inventory\Database\Seeders;

use App\Modules\Auth\Models\Address;
use App\Modules\Inventory\Models\Supplier;
use Illuminate\Database\Seeder;

/**
 * Class SupplierSeeder
 *
 * @package App\Modules\Inventory\Database\Seeders
 */
class SupplierSeeder extends Seeder
{
    public function run(): void
    {
        $address = Address::first() ?? Address::factory()->create();

        $suppliers = [
            [
                'name' => 'Apex Global Logistics & Supplies',
                'code' => 'SUP-APEX-01',
                'contact_name' => 'Michael Adeyemi',
                'email' => 'supply@apexglobal.com',
                'phone' => '+2348012345678',
                'website' => 'https://apexglobal.com',
                'address_id' => $address->id,
                'is_active' => true,
            ],
            [
                'name' => 'Nexus Electronics Wholesale',
                'code' => 'SUP-NEXUS-02',
                'contact_name' => 'Sarah Johnson',
                'email' => 'orders@nexuselectronics.io',
                'phone' => '+14155552671',
                'website' => 'https://nexuselectronics.io',
                'address_id' => $address->id,
                'is_active' => true,
            ],
        ];

        foreach ($suppliers as $sup) {
            Supplier::updateOrCreate(['code' => $sup['code']], $sup);
        }
    }
}
