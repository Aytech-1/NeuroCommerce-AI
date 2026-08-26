<?php

declare(strict_types=1);

use App\Modules\Auth\Models\User;
use App\Modules\Inventory\Models\InventoryItem;
use App\Modules\Inventory\Models\Warehouse;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(DatabaseSeeder::class);
    $this->superAdmin = User::where('email', 'admin@neurocommerce.com')->first();
    $this->customer = User::factory()->create(['user_type' => 'customer']);
});

test('admin can list warehouses with pagination envelope', function () {
    Sanctum::actingAs($this->superAdmin, ['*']);

    $response = $this->getJson('/api/v1/admin/warehouses');

    $response->assertStatus(200)
        ->assertJsonStructure([
            'success',
            'message',
            'data' => [
                '*' => ['id', 'name', 'code', 'is_active', 'is_default', 'priority'],
            ],
            'meta' => ['current_page', 'per_page', 'total', 'last_page'],
            'links',
        ]);
});

test('admin can create, update, and delete a warehouse', function () {
    Sanctum::actingAs($this->superAdmin, ['*']);

    $createPayload = [
        'name' => 'Kano Fulfillment Hub',
        'code' => 'WH-KAN-01',
        'is_active' => true,
        'is_default' => false,
        'priority' => 5,
    ];

    $createResponse = $this->postJson('/api/v1/admin/warehouses', $createPayload);

    $createResponse->assertStatus(201)
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.code', 'WH-KAN-01');

    $warehouseId = $createResponse->json('data.id');

    // Update
    $updatePayload = [
        'name' => 'Kano Central Mega Hub',
        'priority' => 1,
    ];

    $updateResponse = $this->putJson("/api/v1/admin/warehouses/{$warehouseId}", $updatePayload);

    $updateResponse->assertStatus(200)
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.name', 'Kano Central Mega Hub');

    // Delete
    $deleteResponse = $this->deleteJson("/api/v1/admin/warehouses/{$warehouseId}");

    $deleteResponse->assertStatus(204);

    $this->assertDatabaseMissing('warehouses', ['id' => $warehouseId]);
});

test('setting warehouse as default unsets previous default warehouse', function () {
    Sanctum::actingAs($this->superAdmin, ['*']);

    $wh1 = Warehouse::factory()->defaultWarehouse()->create(['code' => 'WH-DEF-1']);
    $wh2 = Warehouse::factory()->create(['code' => 'WH-DEF-2', 'is_default' => false]);

    expect($wh1->fresh()->is_default)->toBeTrue();
    expect($wh2->fresh()->is_default)->toBeFalse();

    $this->putJson("/api/v1/admin/warehouses/{$wh2->id}", [
        'is_default' => true,
    ])->assertStatus(200);

    expect($wh1->fresh()->is_default)->toBeFalse();
    expect($wh2->fresh()->is_default)->toBeTrue();
});

test('cannot delete warehouse with active stock on hand', function () {
    Sanctum::actingAs($this->superAdmin, ['*']);

    $warehouse = Warehouse::where('is_default', true)->first();

    $response = $this->deleteJson("/api/v1/admin/warehouses/{$warehouse->id}");

    $response->assertStatus(422)
        ->assertJsonPath('success', false)
        ->assertJsonPath('code', 'BUSINESS_RULE_VIOLATION');
});
