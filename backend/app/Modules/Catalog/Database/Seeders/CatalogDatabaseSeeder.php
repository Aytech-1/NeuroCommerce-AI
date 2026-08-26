<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Database\Seeders;

use Illuminate\Database\Seeder;

/**
 * Class CatalogDatabaseSeeder
 *
 * Master seeder for Catalog bounded context.
 *
 * @package App\Modules\Catalog\Database\Seeders
 */
class CatalogDatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            CategorySeeder::class,
            BrandSeeder::class,
            AttributeSeeder::class,
            ProductSeeder::class,
        ]);
    }
}
