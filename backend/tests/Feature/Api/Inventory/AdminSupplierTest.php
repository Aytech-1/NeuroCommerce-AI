<?php

declare(strict_types=1);

use App\Modules\Auth\Models\User;
use App\Modules\Inventory\Models\Supplier;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(DatabaseSeeder::class);
    $this->superAdmin = User::where('email', 'admin@neurocommerce.com')->first();
    $this->customer = User::factory()->create(['user_type' => 'customer']);
});

test('admin can list, create, update, and soft delete suppliers', function () {
    Sanctum::actingAs($this->superAdmin, ['*']);

    // List
    $listResponse = $this->getJson('/api/v1/admin/suppliers')
        ->assertStatus(200);

    expect($listResponse->json('meta.total'))->toBeGreaterThanOrEqual(2);

    // Create
    $createPayload = [
        'name' => 'Zenith Component Supplies',
        'code' => 'SUP-ZENITH-01',
        'contact_name' => 'David Adeleke',
        'email' => 'sales@zenithsupplies.com',
        'phone' => '+2348099887766',
        'is_active' => true,
    ];

    $createResponse = $this->postJson('/api/v1/admin/suppliers', $createPayload);

    $createResponse->assertStatus(201)
        ->assertJsonPath('data.code', 'SUP-ZENITH-01');

    $supplierId = $createResponse->json('data.id');

    // Update
    $this->putJson("/api/v1/admin/suppliers/{$supplierId}", [
        'contact_name' => 'David O. Adeleke',
    ])
        ->assertStatus(200)
        ->assertJsonPath('data.contact_name', 'David O. Adeleke');

    // Soft delete
    $this->deleteJson("/api/v1/admin/suppliers/{$supplierId}")
        ->assertStatus(204);

    $this->assertSoftDeleted('suppliers', ['id' => $supplierId]);
});
