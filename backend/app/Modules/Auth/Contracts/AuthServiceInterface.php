<?php

declare(strict_types=1);

namespace App\Modules\Auth\Contracts;

use App\Modules\Auth\DTOs\ChangePasswordDTO;
use App\Modules\Auth\DTOs\ForgotPasswordDTO;
use App\Modules\Auth\DTOs\LoginUserDTO;
use App\Modules\Auth\DTOs\RegisterUserDTO;
use App\Modules\Auth\DTOs\ResetPasswordDTO;
use App\Modules\Auth\DTOs\UpdateProfileDTO;
use App\Modules\Auth\DTOs\VerifyEmailDTO;
use App\Modules\Auth\Models\User;
use Illuminate\Database\Eloquent\Collection;

/**
 * Interface AuthServiceInterface
 *
 * @package App\Modules\Auth\Contracts
 */
interface AuthServiceInterface
{
    /**
     * Register a new customer.
     *
     * @param RegisterUserDTO $dto
     * @return array{user: User, token: array{access_token: string, token_type: string, expires_at: string}}
     */
    public function register(RegisterUserDTO $dto): array;

    /**
     * Authenticate credentials and generate access token.
     *
     * @param LoginUserDTO $dto
     * @param string|null $ip
     * @return array{user: User, token: array{access_token: string, token_type: string, expires_at: string}, permissions: array<int, string>}
     */
    public function login(LoginUserDTO $dto, ?string $ip = null): array;

    /**
     * Invalidate the user's current token.
     *
     * @param User $user
     * @return void
     */
    public function logout(User $user): void;

    /**
     * Refresh access token.
     *
     * @param User $user
     * @return array{access_token: string, token_type: string, expires_at: string}
     */
    public function refreshToken(User $user): array;

    /**
     * Retrieve authenticated user details.
     *
     * @param User $user
     * @return User
     */
    public function me(User $user): User;

    /**
     * Update user profile.
     *
     * @param User $user
     * @param UpdateProfileDTO $dto
     * @return User
     */
    public function updateProfile(User $user, UpdateProfileDTO $dto): User;

    /**
     * Change user password.
     *
     * @param User $user
     * @param ChangePasswordDTO $dto
     * @return void
     */
    public function changePassword(User $user, ChangePasswordDTO $dto): void;

    /**
     * Send password reset token/link.
     *
     * @param ForgotPasswordDTO $dto
     * @return void
     */
    public function forgotPassword(ForgotPasswordDTO $dto): void;

    /**
     * Reset user password using token.
     *
     * @param ResetPasswordDTO $dto
     * @return void
     */
    public function resetPassword(ResetPasswordDTO $dto): void;

    /**
     * Verify email using token.
     *
     * @param VerifyEmailDTO $dto
     * @return void
     */
    public function verifyEmail(VerifyEmailDTO $dto): void;

    /**
     * Resend email verification notification.
     *
     * @param User $user
     * @return void
     */
    public function resendVerification(User $user): void;

    /**
     * Get active customer sessions.
     *
     * @param User $user
     * @return Collection
     */
    public function getSessions(User $user): Collection;

    /**
     * Revoke a specific session.
     *
     * @param User $user
     * @param string $sessionId
     * @return void
     */
    public function revokeSession(User $user, string $sessionId): void;
}
