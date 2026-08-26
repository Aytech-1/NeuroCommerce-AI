<?php

declare(strict_types=1);

namespace App\Modules\Auth\Database\Seeders;

use App\Modules\Auth\Models\Role;
use Illuminate\Database\Seeder;

/**
 * Class RoleSeeder
 *
 * Populates system roles.
 *
 * @package App\Modules\Auth\Database\Seeders
 */
class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            ['name' => 'super_admin', 'guard_name' => 'api', 'description' => 'Super Administrator with full platform bypass access', 'is_system' => true],
            ['name' => 'admin', 'guard_name' => 'api', 'description' => 'Administrator with comprehensive management capabilities', 'is_system' => true],
            ['name' => 'manager', 'guard_name' => 'api', 'description' => 'Store Manager with catalog, inventory, and order operations', 'is_system' => true],
            ['name' => 'customer_support', 'guard_name' => 'api', 'description' => 'Customer support staff for user inquiries and refunds', 'is_system' => true],
            ['name' => 'customer', 'guard_name' => 'api', 'description' => 'Registered customer account', 'is_system' => true],
        ];

        foreach ($roles as $role) {
            Role::updateOrCreate(
                ['name' => $role['name'], 'guard_name' => $role['guard_name']],
                $role
            );
        }
    }
}
