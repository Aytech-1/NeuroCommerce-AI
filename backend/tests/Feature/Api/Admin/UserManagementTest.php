<?php

declare(strict_types=1);

use App\Modules\Auth\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->artisan('db:seed', ['--class' => 'App\\Modules\\Auth\\Database\\Seeders\\AuthDatabaseSeeder']);
});

test('super admin can list, create, update, and manage users', function () {
    $superAdmin = User::where('email', 'admin@neurocommerce.com')->first();
    Sanctum::actingAs($superAdmin, ['*']);

    // 1. List users
    $listResponse = $this->getJson('/api/v1/admin/users');
    $listResponse->assertStatus(200)
        ->assertJsonStructure([
            'success',
            'data' => [
                '*' => ['id', 'email', 'user_type'],
            ],
            'meta',
        ]);

    // 2. Create staff user
    $createResponse = $this->postJson('/api/v1/admin/users', [
        'first_name' => 'Support',
        'last_name' => 'Agent',
        'email' => 'support@neurocommerce.com',
        'password' => 'StaffPass123!',
        'user_type' => 'staff',
        'employee_id' => 'EMP-100200',
        'department' => 'Customer Care',
        'position' => 'Senior Support Specialist',
    ]);

    $createResponse->assertStatus(201)
        ->assertJson([
            'success' => true,
            'data' => [
                'email' => 'support@neurocommerce.com',
                'user_type' => 'staff',
            ],
        ]);

    $createdId = $createResponse->json('data.id');

    // 3. Update status
    $statusResponse = $this->patchJson("/api/v1/admin/users/{$createdId}/status", [
        'is_active' => false,
    ]);

    $statusResponse->assertStatus(200)
        ->assertJson([
            'success' => true,
            'data' => [
                'is_active' => false,
            ],
        ]);

    // 4. Soft delete
    $deleteResponse = $this->deleteJson("/api/v1/admin/users/{$createdId}");
    $deleteResponse->assertStatus(200);

    // 5. Restore
    $restoreResponse = $this->postJson("/api/v1/admin/users/{$createdId}/restore");
    $restoreResponse->assertStatus(200);
});

test('customer cannot access admin user endpoints', function () {
    $customer = User::factory()->create(['user_type' => 'customer']);
    Sanctum::actingAs($customer, ['*']);

    $response = $this->getJson('/api/v1/admin/users');
    $response->assertStatus(403);
});
