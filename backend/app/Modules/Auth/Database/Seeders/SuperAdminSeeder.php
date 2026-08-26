<?php

declare(strict_types=1);

namespace App\Modules\Auth\Database\Seeders;

use App\Modules\Auth\Models\StaffProfile;
use App\Modules\Auth\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Class SuperAdminSeeder
 *
 * Provisions default Super Admin and Administrator test accounts.
 *
 * @package App\Modules\Auth\Database\Seeders
 */
class SuperAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Super Admin
        $superAdmin = User::updateOrCreate(
            ['email' => 'admin@neurocommerce.com'],
            [
                'first_name' => 'System',
                'last_name' => 'Administrator',
                'password' => Hash::make('Admin1234!'),
                'phone' => '+15551234567',
                'user_type' => 'super_admin',
                'is_active' => true,
                'email_verified_at' => now(),
                'locale' => 'en',
                'currency_code' => 'USD',
                'timezone' => 'UTC',
            ]
        );

        $superAdmin->assignRole('super_admin');

        StaffProfile::updateOrCreate(
            ['user_id' => $superAdmin->id],
            [
                'employee_id' => 'EMP-000001',
                'department' => 'Executive',
                'position' => 'Chief Technology Officer',
                'hire_date' => now(),
            ]
        );

        // 2. Demo Customer
        $customer = User::updateOrCreate(
            ['email' => 'customer@example.com'],
            [
                'first_name' => 'Jane',
                'last_name' => 'Doe',
                'password' => Hash::make('Password123!'),
                'phone' => '+15559876543',
                'user_type' => 'customer',
                'is_active' => true,
                'email_verified_at' => now(),
                'locale' => 'en',
                'currency_code' => 'USD',
                'timezone' => 'UTC',
            ]
        );

        $customer->assignRole('customer');
    }
}
