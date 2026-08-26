<?php

declare(strict_types=1);

use App\Modules\Auth\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

test('authenticated user can change password with valid current password', function () {
    $user = User::factory()->create([
        'password' => Hash::make('CurrentPass123!'),
    ]);

    Sanctum::actingAs($user, ['*']);

    $response = $this->postJson('/api/v1/auth/change-password', [
        'current_password' => 'CurrentPass123!',
        'new_password' => 'NewSecurePass456!',
        'new_password_confirmation' => 'NewSecurePass456!',
    ]);

    $response->assertStatus(200)
        ->assertJson([
            'success' => true,
            'message' => 'Password changed successfully.',
        ]);

    $freshUser = $user->fresh();
    expect(Hash::check('NewSecurePass456!', $freshUser->password))->toBeTrue();
});

test('cannot change password with incorrect current password', function () {
    $user = User::factory()->create([
        'password' => Hash::make('CurrentPass123!'),
    ]);

    Sanctum::actingAs($user, ['*']);

    $response = $this->postJson('/api/v1/auth/change-password', [
        'current_password' => 'WrongCurrentPass!',
        'new_password' => 'NewSecurePass456!',
        'new_password_confirmation' => 'NewSecurePass456!',
    ]);

    $response->assertStatus(422);
});

test('forgot password endpoint creates token record in database', function () {
    $user = User::factory()->create(['email' => 'forgotuser@example.com']);

    $response = $this->postJson('/api/v1/auth/forgot-password', [
        'email' => 'forgotuser@example.com',
    ]);

    $response->assertStatus(200)
        ->assertJson([
            'success' => true,
        ]);

    $this->assertDatabaseHas('password_reset_tokens', [
        'email' => 'forgotuser@example.com',
    ]);
});

test('user can reset password using valid reset token', function () {
    $user = User::factory()->create([
        'email' => 'resetme@example.com',
        'password' => Hash::make('OldPassword123!'),
    ]);

    $plainToken = 'valid-reset-token-secret-xyz';
    DB::table('password_reset_tokens')->insert([
        'email' => 'resetme@example.com',
        'token' => Hash::make($plainToken),
        'created_at' => now(),
    ]);

    $response = $this->postJson('/api/v1/auth/reset-password', [
        'token' => $plainToken,
        'email' => 'resetme@example.com',
        'password' => 'BrandNewPass123!',
        'password_confirmation' => 'BrandNewPass123!',
    ]);

    $response->assertStatus(200)
        ->assertJson([
            'success' => true,
        ]);

    $freshUser = $user->fresh();
    expect(Hash::check('BrandNewPass123!', $freshUser->password))->toBeTrue();

    $this->assertDatabaseMissing('password_reset_tokens', [
        'email' => 'resetme@example.com',
    ]);
});
