<?php

declare(strict_types=1);

use App\Modules\Auth\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

test('authenticated user can verify email address', function () {
    $user = User::factory()->unverified()->create([
        'email' => 'unverified@example.com',
    ]);

    $response = $this->postJson('/api/v1/auth/verify-email', [
        'email' => 'unverified@example.com',
        'token' => 'dummy-verification-token',
    ]);

    $response->assertStatus(200)
        ->assertJson([
            'success' => true,
            'message' => 'Email verified successfully.',
        ]);

    expect($user->fresh()->hasVerifiedEmail())->toBeTrue();
});

test('authenticated user can resend verification notification', function () {
    $user = User::factory()->unverified()->create();
    Sanctum::actingAs($user, ['*']);

    $response = $this->postJson('/api/v1/auth/resend-verification');

    $response->assertStatus(200)
        ->assertJson([
            'success' => true,
            'message' => 'Verification email sent successfully.',
        ]);
});

test('cannot resend verification notification if email is already verified', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);
    Sanctum::actingAs($user, ['*']);

    $response = $this->postJson('/api/v1/auth/resend-verification');

    $response->assertStatus(422)
        ->assertJson([
            'success' => false,
            'code' => 'EMAIL_ALREADY_VERIFIED',
        ]);
});
