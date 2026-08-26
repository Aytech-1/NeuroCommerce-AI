<?php

declare(strict_types=1);

namespace App\Modules\Inventory\Database\Seeders;

use Illuminate\Database\Seeder;

/**
 * Class InventoryDatabaseSeeder
 *
 * @package App\Modules\Inventory\Database\Seeders
 */
class InventoryDatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            WarehouseSeeder::class,
            SupplierSeeder::class,
            InventoryItemSeeder::class,
        ]);
    }
}
