<?php

declare(strict_types=1);

use App\Modules\Auth\Models\CustomerProfile;
use App\Modules\Auth\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(DatabaseSeeder::class);
    $this->admin = User::factory()->admin()->create();
    $this->admin->givePermissionTo('user.view', 'user.create', 'user.update', 'user.delete');
});

test('admin can list customers with filters and pagination', function () {
    User::factory()->count(5)->customer()->create();

    Sanctum::actingAs($this->admin, ['*']);

    $response = $this->getJson('/api/v1/admin/users?user_type=customer');

    $response->assertStatus(200)
        ->assertJsonPath('success', true)
        ->assertJsonStructure([
            'success',
            'data' => [
                '*' => ['id', 'first_name', 'last_name', 'email', 'user_type', 'is_active'],
            ],
            'meta' => ['current_page', 'per_page', 'total'],
        ]);
});

test('admin can view customer details with profile', function () {
    $customer = User::factory()->customer()->create([
        'first_name' => 'Alice',
        'last_name' => 'Smith',
        'email' => 'alice@example.com',
    ]);
    CustomerProfile::create([
        'user_id' => $customer->id,
        'customer_group' => 'vip',
        'loyalty_points' => 500,
    ]);

    Sanctum::actingAs($this->admin, ['*']);

    $response = $this->getJson("/api/v1/admin/users/{$customer->id}");

    $response->assertStatus(200)
        ->assertJsonPath('data.first_name', 'Alice')
        ->assertJsonPath('data.email', 'alice@example.com')
        ->assertJsonPath('data.profile.customer_group', 'vip');
});

test('admin can update customer account details', function () {
    $customer = User::factory()->customer()->create();

    Sanctum::actingAs($this->admin, ['*']);

    $response = $this->putJson("/api/v1/admin/users/{$customer->id}", [
        'first_name' => 'AdminUpdated',
        'last_name' => 'AdminLast',
        'phone' => '+15559876543',
    ]);

    $response->assertStatus(200)
        ->assertJsonPath('data.first_name', 'AdminUpdated');

    $this->assertDatabaseHas('users', [
        'id' => $customer->id,
        'first_name' => 'AdminUpdated',
    ]);
});

test('admin can activate and deactivate customer account status', function () {
    $customer = User::factory()->customer()->create(['is_active' => true]);

    Sanctum::actingAs($this->admin, ['*']);

    $response = $this->patchJson("/api/v1/admin/users/{$customer->id}/status", [
        'is_active' => false,
    ]);

    $response->assertStatus(200)
        ->assertJsonPath('data.is_active', false);

    expect($customer->fresh()->is_active)->toBeFalse();
});

test('admin can soft delete and restore customer account', function () {
    $customer = User::factory()->customer()->create();

    Sanctum::actingAs($this->admin, ['*']);

    $deleteResponse = $this->deleteJson("/api/v1/admin/users/{$customer->id}");
    $deleteResponse->assertStatus(200);

    $this->assertSoftDeleted('users', ['id' => $customer->id]);

    $restoreResponse = $this->postJson("/api/v1/admin/users/{$customer->id}/restore");
    $restoreResponse->assertStatus(200);

    $this->assertDatabaseHas('users', [
        'id' => $customer->id,
        'deleted_at' => null,
    ]);
});

test('customer cannot access admin user management endpoints', function () {
    $customer = User::factory()->customer()->create();
    $target = User::factory()->customer()->create();

    Sanctum::actingAs($customer, ['*']);

    $this->getJson('/api/v1/admin/users')->assertStatus(403);
    $this->getJson("/api/v1/admin/users/{$target->id}")->assertStatus(403);
    $this->putJson("/api/v1/admin/users/{$target->id}", ['first_name' => 'Hacked'])->assertStatus(403);
    $this->deleteJson("/api/v1/admin/users/{$target->id}")->assertStatus(403);
});
