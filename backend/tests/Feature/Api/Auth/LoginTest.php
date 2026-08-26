<?php

declare(strict_types=1);

use App\Modules\Auth\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->artisan('db:seed', ['--class' => 'App\\Modules\\Auth\\Database\\Seeders\\AuthDatabaseSeeder']);
});

test('user can log in with valid credentials', function () {
    $user = User::factory()->create([
        'email' => 'loginuser@example.com',
        'password' => Hash::make('ValidPass123!'),
        'is_active' => true,
    ]);

    $response = $this->postJson('/api/v1/auth/login', [
        'email' => 'loginuser@example.com',
        'password' => 'ValidPass123!',
        'device_name' => 'TestRunner Browser',
    ]);

    $response->assertStatus(200)
        ->assertJsonStructure([
            'success',
            'message',
            'data' => [
                'user' => [
                    'id',
                    'first_name',
                    'last_name',
                    'email',
                    'user_type',
                    'is_active',
                ],
                'token' => [
                    'access_token',
                    'token_type',
                    'expires_at',
                ],
                'permissions',
            ],
        ])
        ->assertJson([
            'success' => true,
            'data' => [
                'user' => [
                    'email' => 'loginuser@example.com',
                ],
                'token' => [
                    'token_type' => 'Bearer',
                ],
            ],
        ]);

    $freshUser = $user->fresh();
    expect($freshUser->last_login_at)->not->toBeNull();

    $this->assertDatabaseHas('customer_sessions', [
        'user_id' => $user->id,
    ]);
});

test('cannot log in with incorrect password', function () {
    User::factory()->create([
        'email' => 'wrongpass@example.com',
        'password' => Hash::make('ValidPass123!'),
    ]);

    $response = $this->postJson('/api/v1/auth/login', [
        'email' => 'wrongpass@example.com',
        'password' => 'WrongPass123!',
    ]);

    $response->assertStatus(401)
        ->assertJson([
            'success' => false,
            'code' => 'UNAUTHENTICATED',
        ]);
});

test('cannot log in with non-existent email', function () {
    $response = $this->postJson('/api/v1/auth/login', [
        'email' => 'nonexistent@example.com',
        'password' => 'SomePassword123!',
    ]);

    $response->assertStatus(401)
        ->assertJson([
            'success' => false,
            'code' => 'UNAUTHENTICATED',
        ]);
});

test('cannot log in when user account is deactivated', function () {
    User::factory()->create([
        'email' => 'inactive@example.com',
        'password' => Hash::make('ValidPass123!'),
        'is_active' => false,
    ]);

    $response = $this->postJson('/api/v1/auth/login', [
        'email' => 'inactive@example.com',
        'password' => 'ValidPass123!',
    ]);

    $response->assertStatus(403)
        ->assertJson([
            'success' => false,
            'code' => 'FORBIDDEN',
        ]);
});
