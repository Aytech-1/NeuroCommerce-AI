<?php

declare(strict_types=1);

use App\Modules\Auth\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(DatabaseSeeder::class);
    $this->customer = User::factory()->create(['user_type' => 'customer']);
});

test('unauthenticated request to inventory endpoints returns 401', function () {
    $this->getJson('/api/v1/admin/inventory')
        ->assertStatus(401)
        ->assertJsonPath('success', false)
        ->assertJsonPath('code', 'UNAUTHORIZED');

    $this->getJson('/api/v1/admin/warehouses')
        ->assertStatus(401);

    $this->getJson('/api/v1/admin/suppliers')
        ->assertStatus(401);
});

test('customer role cannot access admin inventory endpoints and gets 403', function () {
    Sanctum::actingAs($this->customer, ['*']);

    $this->getJson('/api/v1/admin/inventory')
        ->assertStatus(403)
        ->assertJsonPath('success', false)
        ->assertJsonPath('code', 'FORBIDDEN');

    $this->getJson('/api/v1/admin/warehouses')
        ->assertStatus(403);

    $this->getJson('/api/v1/admin/suppliers')
        ->assertStatus(403);
});
