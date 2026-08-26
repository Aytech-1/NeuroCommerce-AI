<?php

declare(strict_types=1);

use App\Modules\Auth\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->artisan('db:seed', ['--class' => 'App\\Modules\\Auth\\Database\\Seeders\\AuthDatabaseSeeder']);
});

test('guest can register a new customer account', function () {
    $response = $this->postJson('/api/v1/auth/register', [
        'first_name' => 'Alexander',
        'last_name' => 'Hamilton',
        'email' => 'alex@example.com',
        'password' => 'SecurePass123!',
        'password_confirmation' => 'SecurePass123!',
        'phone' => '+14155552671',
        'agree_to_terms' => true,
    ]);

    $response->assertStatus(201)
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
            ],
        ])
        ->assertJson([
            'success' => true,
            'data' => [
                'user' => [
                    'first_name' => 'Alexander',
                    'last_name' => 'Hamilton',
                    'email' => 'alex@example.com',
                    'user_type' => 'customer',
                    'is_active' => true,
                ],
                'token' => [
                    'token_type' => 'Bearer',
                ],
            ],
        ]);

    $this->assertDatabaseHas('users', [
        'email' => 'alex@example.com',
        'first_name' => 'Alexander',
        'user_type' => 'customer',
    ]);

    $user = User::where('email', 'alex@example.com')->first();
    expect($user)->not->toBeNull()
        ->and($user->customerProfile)->not->toBeNull()
        ->and($user->customerProfile->customer_group)->toBe('regular');
});

test('cannot register with duplicate email', function () {
    User::factory()->create(['email' => 'duplicate@example.com']);

    $response = $this->postJson('/api/v1/auth/register', [
        'first_name' => 'John',
        'last_name' => 'Doe',
        'email' => 'duplicate@example.com',
        'password' => 'SecurePass123!',
        'password_confirmation' => 'SecurePass123!',
        'agree_to_terms' => true,
    ]);

    $response->assertStatus(422)
        ->assertJson([
            'success' => false,
            'code' => 'VALIDATION_ERROR',
        ]);
});

test('cannot register with weak password lacking uppercase or digits', function () {
    $response = $this->postJson('/api/v1/auth/register', [
        'first_name' => 'John',
        'last_name' => 'Doe',
        'email' => 'weakpass@example.com',
        'password' => 'weakpassword',
        'password_confirmation' => 'weakpassword',
        'agree_to_terms' => true,
    ]);

    $response->assertStatus(422)
        ->assertJson([
            'success' => false,
            'code' => 'VALIDATION_ERROR',
        ]);
});

test('cannot register without agreeing to terms', function () {
    $response = $this->postJson('/api/v1/auth/register', [
        'first_name' => 'John',
        'last_name' => 'Doe',
        'email' => 'noterms@example.com',
        'password' => 'SecurePass123!',
        'password_confirmation' => 'SecurePass123!',
        'agree_to_terms' => false,
    ]);

    $response->assertStatus(422)
        ->assertJson([
            'success' => false,
            'code' => 'VALIDATION_ERROR',
        ]);
});

test('cannot register with mismatched password confirmation', function () {
    $response = $this->postJson('/api/v1/auth/register', [
        'first_name' => 'John',
        'last_name' => 'Doe',
        'email' => 'mismatch@example.com',
        'password' => 'SecurePass123!',
        'password_confirmation' => 'DifferentPass123!',
        'agree_to_terms' => true,
    ]);

    $response->assertStatus(422)
        ->assertJson([
            'success' => false,
            'code' => 'VALIDATION_ERROR',
        ]);
});
