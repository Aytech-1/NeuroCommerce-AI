<?php

declare(strict_types=1);

namespace App\Modules\Auth\Database\Seeders;

use App\Modules\Auth\Models\Permission;
use App\Modules\Auth\Models\Role;
use Illuminate\Database\Seeder;

/**
 * Class RolePermissionSeeder
 *
 * Maps permissions to roles based on the enterprise RBAC permission matrix.
 *
 * @package App\Modules\Auth\Database\Seeders
 */
class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Super Admin gets all permissions
        $superAdmin = Role::where('name', 'super_admin')->first();
        if ($superAdmin) {
            $allPermissions = Permission::all();
            $superAdmin->syncPermissions($allPermissions);
        }

        // 2. Admin gets almost all permissions except system settings lock
        $admin = Role::where('name', 'admin')->first();
        if ($admin) {
            $adminPermissions = Permission::whereNotIn('name', ['settings.update'])->get();
            $admin->syncPermissions($adminPermissions);
        }

        // 3. Manager
        $manager = Role::where('name', 'manager')->first();
        if ($manager) {
            $managerPermissions = Permission::whereIn('name', [
                'user.view',
                'product.view', 'product.create', 'product.update',
                'order.view', 'order.update',
                'inventory.view', 'inventory.adjust',
                'warehouse.view', 'warehouse.create', 'warehouse.update',
                'supplier.view', 'supplier.create', 'supplier.update',
                'coupon.view', 'coupon.create', 'coupon.update',
                'review.view', 'review.moderate', 'review.delete',
                'cms.view', 'cms.create', 'cms.update',
                'report.view',
            ])->get();
            $manager->syncPermissions($managerPermissions);
        }

        // 4. Customer Support
        $support = Role::where('name', 'customer_support')->first();
        if ($support) {
            $supportPermissions = Permission::whereIn('name', [
                'user.view',
                'product.view',
                'order.view', 'order.update', 'order.refund',
                'review.view', 'review.moderate',
            ])->get();
            $support->syncPermissions($supportPermissions);
        }

        // 5. Customer
        $customer = Role::where('name', 'customer')->first();
        if ($customer) {
            $customerPermissions = Permission::whereIn('name', [
                'product.view',
                'review.view', 'review.create',
                'wishlist.manage',
            ])->get();
            $customer->syncPermissions($customerPermissions);
        }
    }
}
