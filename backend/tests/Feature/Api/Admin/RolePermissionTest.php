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
