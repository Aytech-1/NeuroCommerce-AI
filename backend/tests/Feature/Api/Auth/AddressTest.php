<?php

declare(strict_types=1);

use App\Modules\Auth\Models\Address;
use App\Modules\Auth\Models\User;
use App\Modules\Core\Models\Country;
use App\Modules\Order\Models\Order;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

beforeEach(function () {
    Country::updateOrCreate(['code' => 'US'], ['name' => 'United States', 'is_active' => true]);
});

test('authenticated user can create and list their addresses', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user, ['*']);

    $response = $this->postJson('/api/v1/addresses', [
        'first_name' => 'John',
        'last_name' => 'Doe',
        'address_line_1' => '123 Market Street',
        'city' => 'San Francisco',
        'postal_code' => '94105',
        'country_code' => 'US',
        'phone' => '+14155551234',
        'label' => 'Headquarters',
        'is_default' => true,
    ]);

    $response->assertStatus(201)
        ->assertJson([
            'success' => true,
            'data' => [
                'first_name' => 'John',
                'last_name' => 'Doe',
                'city' => 'San Francisco',
                'is_default' => true,
            ],
        ]);

    $listResponse = $this->getJson('/api/v1/addresses');
    $listResponse->assertStatus(200)
        ->assertJsonCount(1, 'data');
});

test('user can set address as default via POST or PATCH', function () {
    $user = User::factory()->create();
    $address1 = Address::factory()->create(['addressable_id' => $user->id, 'is_default' => true]);
    $address2 = Address::factory()->create(['addressable_id' => $user->id, 'is_default' => false]);

    Sanctum::actingAs($user, ['*']);

    $response = $this->patchJson("/api/v1/addresses/{$address2->id}/default");

    $response->assertStatus(200);
    expect($address2->fresh()->is_default)->toBeTrue()
        ->and($address1->fresh()->is_default)->toBeFalse();
});

test('user can update their own address', function () {
    $user = User::factory()->create();
    $address = Address::factory()->create([
        'addressable_id' => $user->id,
        'first_name' => 'Original',
        'city' => 'New York',
    ]);

    Sanctum::actingAs($user, ['*']);

    $response = $this->putJson("/api/v1/addresses/{$address->id}", [
        'first_name' => 'UpdatedName',
        'last_name' => 'UpdatedLast',
        'address_line_1' => '456 Updated Ave',
        'city' => 'Boston',
        'postal_code' => '02108',
        'country_code' => 'US',
    ]);

    $response->assertStatus(200)
        ->assertJsonPath('data.first_name', 'UpdatedName')
        ->assertJsonPath('data.city', 'Boston');

    $this->assertDatabaseHas('addresses', [
        'id' => $address->id,
        'first_name' => 'UpdatedName',
        'city' => 'Boston',
    ]);
});

test('user cannot view, update, delete or set default on another users address', function () {
    $user1 = User::factory()->create();
    $user2 = User::factory()->create();
    $address2 = Address::factory()->create(['addressable_id' => $user2->id]);

    Sanctum::actingAs($user1, ['*']);

    $this->getJson("/api/v1/addresses/{$address2->id}")->assertStatus(404);
    $this->putJson("/api/v1/addresses/{$address2->id}", [
        'first_name' => 'Hacked',
        'last_name' => 'User',
        'address_line_1' => 'Hacked St',
        'city' => 'Hacked City',
        'postal_code' => '99999',
        'country_code' => 'US',
    ])->assertStatus(404);
    $this->deleteJson("/api/v1/addresses/{$address2->id}")->assertStatus(404);
    $this->patchJson("/api/v1/addresses/{$address2->id}/default")->assertStatus(404);
});

test('unauthenticated address request returns 401', function () {
    $this->getJson('/api/v1/addresses')->assertStatus(401);
    $this->postJson('/api/v1/addresses', [])->assertStatus(401);
});

test('invalid address payload fails validation with 422', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user, ['*']);

    $response = $this->postJson('/api/v1/addresses', [
        'first_name' => '',
        'country_code' => 'INVALID',
    ]);

    $response->assertStatus(422)
        ->assertJsonPath('code', 'VALIDATION_ERROR');
});

test('deleting a customer address does not alter historical order addresses', function () {
    $user = User::factory()->create();
    $customerAddress = Address::factory()->create(['addressable_id' => $user->id]);

    $order = Order::factory()->create(['user_id' => $user->id]);
    $orderAddress = Address::factory()->create([
        'addressable_type' => Order::class,
        'addressable_id' => $order->id,
        'address_line_1' => 'Historical Order Address Line',
    ]);

    Sanctum::actingAs($user, ['*']);

    $response = $this->deleteJson("/api/v1/addresses/{$customerAddress->id}");
    $response->assertStatus(200);

    $this->assertSoftDeleted('addresses', ['id' => $customerAddress->id]);
    $this->assertDatabaseHas('addresses', [
        'id' => $orderAddress->id,
        'addressable_id' => $order->id,
        'deleted_at' => null,
    ]);
});
