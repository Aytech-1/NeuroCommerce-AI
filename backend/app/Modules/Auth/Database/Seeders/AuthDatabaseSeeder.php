<?php

declare(strict_types=1);

namespace App\Modules\Auth\Database\Seeders;

use Illuminate\Database\Seeder;

/**
 * Class AuthDatabaseSeeder
 *
 * @package App\Modules\Auth\Database\Seeders
 */
class AuthDatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->call([
            CountrySeeder::class,
            CurrencySeeder::class,
            PermissionSeeder::class,
            RoleSeeder::class,
            RolePermissionSeeder::class,
            SuperAdminSeeder::class,
        ]);
    }
}
