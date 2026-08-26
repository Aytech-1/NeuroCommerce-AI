<?php

declare(strict_types=1);

use App\Modules\Auth\Models\CustomerProfile;
use App\Modules\Auth\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

test('authenticated user can fetch their profile via me endpoint', function () {
    $user = User::factory()->create([
        'first_name' => 'Grace',
        'last_name' => 'Hopper',
        'email' => 'grace@example.com',
    ]);
    CustomerProfile::create([
        'user_id' => $user->id,
        'customer_group' => 'vip',
        'loyalty_points' => 350,
    ]);

    Sanctum::actingAs($user, ['*']);

    $response = $this->getJson('/api/v1/auth/me');

    $response->assertStatus(200)
        ->assertJson([
            'success' => true,
            'data' => [
                'id' => $user->id,
                'first_name' => 'Grace',
                'last_name' => 'Hopper',
                'email' => 'grace@example.com',
                'profile' => [
                    'customer_group' => 'vip',
                    'loyalty_points' => 350,
                ],
            ],
        ])
        ->assertJsonMissing([
            'password' => true,
            'two_factor_secret' => true,
            'remember_token' => true,
        ]);
});

test('authenticated user can update their profile', function () {
    $user = User::factory()->create([
        'first_name' => 'Original',
        'last_name' => 'Name',
    ]);
    CustomerProfile::create([
        'user_id' => $user->id,
        'customer_group' => 'regular',
    ]);

    Sanctum::actingAs($user, ['*']);

    $response = $this->putJson('/api/v1/auth/me', [
        'first_name' => 'Updated',
        'last_name' => 'User',
        'phone' => '+14155551234',
        'company' => 'Tech Corp',
    ]);

    $response->assertStatus(200)
        ->assertJson([
            'success' => true,
            'data' => [
                'first_name' => 'Updated',
                'last_name' => 'User',
                'phone' => '+14155551234',
            ],
        ]);

    $this->assertDatabaseHas('users', [
        'id' => $user->id,
        'first_name' => 'Updated',
        'last_name' => 'User',
    ]);

    $this->assertDatabaseHas('customer_profiles', [
        'user_id' => $user->id,
        'company' => 'Tech Corp',
    ]);
});
