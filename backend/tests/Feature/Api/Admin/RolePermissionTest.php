<?php

declare(strict_types=1);

use App\Modules\Auth\Models\Role;
use App\Modules\Auth\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->artisan('db:seed', ['--class' => 'App\\Modules\\Auth\\Database\\Seeders\\AuthDatabaseSeeder']);
});

test('super admin can view roles and permissions', function () {
    $superAdmin = User::where('email', 'admin@neurocommerce.com')->first();
    Sanctum::actingAs($superAdmin, ['*']);

    $rolesResponse = $this->getJson('/api/v1/admin/roles');
    $rolesResponse->assertStatus(200)
        ->assertJson([
            'success' => true,
        ])
        ->assertJsonStructure([
            'data' => [
                '*' => ['id', 'name', 'guard_name', 'is_system', 'permissions_count'],
            ],
        ]);

    $permissionsResponse = $this->getJson('/api/v1/admin/permissions');
    $permissionsResponse->assertStatus(200)
        ->assertJson([
            'success' => true,
        ]);
});

test('super admin can create new custom role and sync permissions', function () {
    $superAdmin = User::where('email', 'admin@neurocommerce.com')->first();
    Sanctum::actingAs($superAdmin, ['*']);

    $createResponse = $this->postJson('/api/v1/admin/roles', [
        'name' => 'content_editor',
        'description' => 'Content and blog editor role',
        'permissions' => ['cms.view', 'cms.create', 'cms.update'],
    ]);

    $createResponse->assertStatus(201)
        ->assertJson([
            'success' => true,
            'data' => [
                'name' => 'content_editor',
                'is_system' => false,
            ],
        ]);

    $roleId = $createResponse->json('data.id');

    $syncResponse = $this->putJson("/api/v1/admin/roles/{$roleId}/permissions", [
        'permissions' => ['cms.view', 'cms.create', 'cms.update', 'cms.delete'],
    ]);

    $syncResponse->assertStatus(200);

    $role = Role::find($roleId);
    expect($role->hasPermissionTo('cms.delete', 'api'))->toBeTrue();
});

test('system roles cannot be deleted', function () {
    $superAdmin = User::where('email', 'admin@neurocommerce.com')->first();
    Sanctum::actingAs($superAdmin, ['*']);

    $adminRole = Role::where('name', 'admin')->first();

    $response = $this->deleteJson("/api/v1/admin/roles/{$adminRole->id}");
    $response->assertStatus(422);
});

test('super admin user account cannot be deleted or deactivated', function () {
    $superAdmin = User::where('email', 'admin@neurocommerce.com')->first();
    Sanctum::actingAs($superAdmin, ['*']);

    // Attempt delete
    $deleteResponse = $this->deleteJson("/api/v1/admin/users/{$superAdmin->id}");
    $deleteResponse->assertStatus(422);

    // Attempt deactivate
    $deactivateResponse = $this->patchJson("/api/v1/admin/users/{$superAdmin->id}/status", [
        'is_active' => false,
    ]);
    $deactivateResponse->assertStatus(422);
});

test('unprivileged customer receives 403 on role and permission endpoints', function () {
    $customer = User::factory()->customer()->create();
    Sanctum::actingAs($customer, ['*']);

    $this->getJson('/api/v1/admin/roles')->assertStatus(403);
    $this->getJson('/api/v1/admin/permissions')->assertStatus(403);
    $this->postJson('/api/v1/admin/roles', ['name' => 'attacker_role'])->assertStatus(403);
});

