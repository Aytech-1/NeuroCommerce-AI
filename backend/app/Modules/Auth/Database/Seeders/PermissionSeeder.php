<?php

declare(strict_types=1);

namespace App\Modules\Auth\Database\Seeders;

use App\Modules\Auth\Models\Permission;
use Illuminate\Database\Seeder;

/**
 * Class PermissionSeeder
 *
 * Populates granular system permissions in {module}.{action} format.
 *
 * @package App\Modules\Auth\Database\Seeders
 */
class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = [
            // User Module
            ['name' => 'user.view', 'module' => 'user', 'description' => 'View users and profiles', 'guard_name' => 'api'],
            ['name' => 'user.create', 'module' => 'user', 'description' => 'Create staff or customer users', 'guard_name' => 'api'],
            ['name' => 'user.update', 'module' => 'user', 'description' => 'Update user details', 'guard_name' => 'api'],
            ['name' => 'user.delete', 'module' => 'user', 'description' => 'Soft delete or restore users', 'guard_name' => 'api'],
            ['name' => 'user.manage', 'module' => 'user', 'description' => 'Manage user account status and roles', 'guard_name' => 'api'],

            // Role Module
            ['name' => 'role.view', 'module' => 'role', 'description' => 'View roles and permission assignments', 'guard_name' => 'api'],
            ['name' => 'role.create', 'module' => 'role', 'description' => 'Create new roles', 'guard_name' => 'api'],
            ['name' => 'role.update', 'module' => 'role', 'description' => 'Update roles and sync permissions', 'guard_name' => 'api'],
            ['name' => 'role.delete', 'module' => 'role', 'description' => 'Delete non-system roles', 'guard_name' => 'api'],
            ['name' => 'permission.view', 'module' => 'role', 'description' => 'View all system permissions', 'guard_name' => 'api'],

            // Product & Catalog Module
            ['name' => 'product.view', 'module' => 'catalog', 'description' => 'View products', 'guard_name' => 'api'],
            ['name' => 'product.create', 'module' => 'catalog', 'description' => 'Create products', 'guard_name' => 'api'],
            ['name' => 'product.update', 'module' => 'catalog', 'description' => 'Update products', 'guard_name' => 'api'],
            ['name' => 'product.delete', 'module' => 'catalog', 'description' => 'Delete products', 'guard_name' => 'api'],

            // Order Module
            ['name' => 'order.view', 'module' => 'order', 'description' => 'View orders', 'guard_name' => 'api'],
            ['name' => 'order.update', 'module' => 'order', 'description' => 'Update order status and fulfillment', 'guard_name' => 'api'],
            ['name' => 'order.delete', 'module' => 'order', 'description' => 'Cancel or delete orders', 'guard_name' => 'api'],
            ['name' => 'order.refund', 'module' => 'order', 'description' => 'Process order refunds', 'guard_name' => 'api'],

            // Payment Module
            ['name' => 'payment.view', 'module' => 'payment', 'description' => 'View payments and transactions', 'guard_name' => 'api'],
            ['name' => 'payment.refund', 'module' => 'payment', 'description' => 'Process payment refunds', 'guard_name' => 'api'],
            ['name' => 'payment.reconcile', 'module' => 'payment', 'description' => 'Reconcile payment transactions', 'guard_name' => 'api'],
            ['name' => 'payment.admin', 'module' => 'payment', 'description' => 'Full payment administration', 'guard_name' => 'api'],

            // Shipping Module
            ['name' => 'shipping.view', 'module' => 'shipping', 'description' => 'View shipping methods, zones and shipments', 'guard_name' => 'api'],
            ['name' => 'shipping.create', 'module' => 'shipping', 'description' => 'Create shipments and shipping methods', 'guard_name' => 'api'],
            ['name' => 'shipping.update', 'module' => 'shipping', 'description' => 'Update shipment status and shipping methods', 'guard_name' => 'api'],
            ['name' => 'shipping.delete', 'module' => 'shipping', 'description' => 'Delete shipping methods and zones', 'guard_name' => 'api'],

            // Inventory Module
            ['name' => 'inventory.view', 'module' => 'inventory', 'description' => 'View stock and inventory logs', 'guard_name' => 'api'],
            ['name' => 'inventory.adjust', 'module' => 'inventory', 'description' => 'Adjust warehouse inventory stock', 'guard_name' => 'api'],
            ['name' => 'warehouse.view', 'module' => 'inventory', 'description' => 'View warehouses', 'guard_name' => 'api'],
            ['name' => 'warehouse.create', 'module' => 'inventory', 'description' => 'Create warehouses', 'guard_name' => 'api'],
            ['name' => 'warehouse.update', 'module' => 'inventory', 'description' => 'Update warehouses', 'guard_name' => 'api'],
            ['name' => 'warehouse.delete', 'module' => 'inventory', 'description' => 'Delete warehouses', 'guard_name' => 'api'],
            ['name' => 'supplier.view', 'module' => 'inventory', 'description' => 'View suppliers', 'guard_name' => 'api'],
            ['name' => 'supplier.create', 'module' => 'inventory', 'description' => 'Create suppliers', 'guard_name' => 'api'],
            ['name' => 'supplier.update', 'module' => 'inventory', 'description' => 'Update suppliers', 'guard_name' => 'api'],
            ['name' => 'supplier.delete', 'module' => 'inventory', 'description' => 'Delete suppliers', 'guard_name' => 'api'],

            // Coupon Module
            ['name' => 'coupon.view', 'module' => 'coupon', 'description' => 'View coupons', 'guard_name' => 'api'],
            ['name' => 'coupon.create', 'module' => 'coupon', 'description' => 'Create coupons', 'guard_name' => 'api'],
            ['name' => 'coupon.update', 'module' => 'coupon', 'description' => 'Update coupons', 'guard_name' => 'api'],
            ['name' => 'coupon.delete', 'module' => 'coupon', 'description' => 'Delete coupons', 'guard_name' => 'api'],
            ['name' => 'coupon.manage', 'module' => 'coupon', 'description' => 'Full coupon management', 'guard_name' => 'api'],

            // Review Module
            ['name' => 'review.view', 'module' => 'review', 'description' => 'View product reviews', 'guard_name' => 'api'],
            ['name' => 'review.create', 'module' => 'review', 'description' => 'Write product reviews', 'guard_name' => 'api'],
            ['name' => 'review.moderate', 'module' => 'review', 'description' => 'Approve or reject reviews', 'guard_name' => 'api'],
            ['name' => 'review.delete', 'module' => 'review', 'description' => 'Delete product reviews', 'guard_name' => 'api'],

            // Wishlist
            ['name' => 'wishlist.manage', 'module' => 'wishlist', 'description' => 'Manage user wishlists', 'guard_name' => 'api'],

            // CMS Module
            ['name' => 'cms.view', 'module' => 'cms', 'description' => 'View CMS pages and banners', 'guard_name' => 'api'],
            ['name' => 'cms.create', 'module' => 'cms', 'description' => 'Create CMS content', 'guard_name' => 'api'],
            ['name' => 'cms.update', 'module' => 'cms', 'description' => 'Update CMS content', 'guard_name' => 'api'],
            ['name' => 'cms.delete', 'module' => 'cms', 'description' => 'Delete CMS content', 'guard_name' => 'api'],

            // Reports & Analytics
            ['name' => 'report.view', 'module' => 'admin', 'description' => 'View administrative business reports', 'guard_name' => 'api'],

            // Settings & Platform Governance
            ['name' => 'settings.view', 'module' => 'admin', 'description' => 'View platform configuration', 'guard_name' => 'api'],
            ['name' => 'settings.update', 'module' => 'admin', 'description' => 'Update platform configuration', 'guard_name' => 'api'],
            ['name' => 'setting.view', 'module' => 'admin', 'description' => 'View platform settings', 'guard_name' => 'api'],
            ['name' => 'setting.update', 'module' => 'admin', 'description' => 'Update platform settings', 'guard_name' => 'api'],
            ['name' => 'dashboard.view', 'module' => 'admin', 'description' => 'View admin dashboard', 'guard_name' => 'api'],
            ['name' => 'config.view', 'module' => 'admin', 'description' => 'View system configs and feature flags', 'guard_name' => 'api'],
            ['name' => 'config.update', 'module' => 'admin', 'description' => 'Update system configs and feature flags', 'guard_name' => 'api'],
            ['name' => 'audit.view', 'module' => 'admin', 'description' => 'View audit and activity logs', 'guard_name' => 'api'],
            ['name' => 'notification.view', 'module' => 'notification', 'description' => 'View admin notifications', 'guard_name' => 'api'],
        ];

        foreach ($permissions as $permission) {
            Permission::updateOrCreate(
                ['name' => $permission['name'], 'guard_name' => $permission['guard_name']],
                $permission
            );
        }
    }
}
