<?php

declare(strict_types=1);

namespace App\Modules\Auth\Controllers\Api;

use App\Core\Helpers\ResponseHelper;
use App\Modules\Auth\Contracts\AuthServiceInterface;
use App\Modules\Auth\Models\User;
use App\Modules\Auth\Requests\ChangePasswordRequest;
use App\Modules\Auth\Requests\ForgotPasswordRequest;
use App\Modules\Auth\Requests\LoginRequest;
use App\Modules\Auth\Requests\RegisterRequest;
use App\Modules\Auth\Requests\ResendVerificationRequest;
use App\Modules\Auth\Requests\ResetPasswordRequest;
use App\Modules\Auth\Requests\UpdateProfileRequest;
use App\Modules\Auth\Requests\VerifyEmailRequest;
use App\Modules\Auth\Resources\CustomerSessionResource;
use App\Modules\Auth\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

/**
 * Class AuthController
 *
 * Handles customer authentication, password management, profile and session lifecycle.
 *
 * @package App\Modules\Auth\Controllers\Api
 */
class AuthController extends Controller
{
    /**
     * AuthController constructor.
     *
     * @param AuthServiceInterface $authService
     */
    public function __construct(
        protected readonly AuthServiceInterface $authService
    ) {
    }

    /**
     * Register a new customer account.
     *
     * @param RegisterRequest $request
     * @return JsonResponse
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $result = $this->authService->register($request->toDTO());

        return ResponseHelper::created([
            'user' => new UserResource($result['user']),
            'token' => $result['token'],
        ], 'Account created successfully. Please verify your email.');
    }

    /**
     * Authenticate and receive Sanctum bearer token.
     *
     * @param LoginRequest $request
     * @return JsonResponse
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $result = $this->authService->login($request->toDTO(), $request->ip());

        return ResponseHelper::success([
            'user' => new UserResource($result['user']),
            'token' => $result['token'],
            'permissions' => $result['permissions'],
        ], 'Login successful.');
    }

    /**
     * Log out and revoke current access token.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function logout(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $this->authService->logout($user);

        return ResponseHelper::success(null, 'Logged out successfully.');
    }

    /**
     * Refresh access token.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function refreshToken(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $token = $this->authService->refreshToken($user);

        return ResponseHelper::success([
            'token' => $token,
        ], 'Token refreshed successfully.');
    }

    /**
     * Get current authenticated user.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function me(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $me = $this->authService->me($user);

        return ResponseHelper::success(new UserResource($me), 'User profile retrieved successfully.');
    }

    /**
     * Update current user profile.
     *
     * @param UpdateProfileRequest $request
     * @return JsonResponse
     */
    public function updateProfile(UpdateProfileRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $updatedUser = $this->authService->updateProfile($user, $request->toDTO());

        return ResponseHelper::success(new UserResource($updatedUser), 'Profile updated successfully.');
    }

    /**
     * Change password.
     *
     * @param ChangePasswordRequest $request
     * @return JsonResponse
     */
    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $this->authService->changePassword($user, $request->toDTO());

        return ResponseHelper::success(null, 'Password changed successfully.');
    }

    /**
     * Request password reset token.
     *
     * @param ForgotPasswordRequest $request
     * @return JsonResponse
     */
    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $this->authService->forgotPassword($request->toDTO());

        return ResponseHelper::success(null, 'If your email is in our records, a password reset link has been sent.');
    }

    /**
     * Reset password using token.
     *
     * @param ResetPasswordRequest $request
     * @return JsonResponse
     */
    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $this->authService->resetPassword($request->toDTO());

        return ResponseHelper::success(null, 'Password has been reset successfully. Please log in with your new password.');
    }

    /**
     * Verify email address.
     *
     * @param VerifyEmailRequest $request
     * @return JsonResponse
     */
    public function verifyEmail(VerifyEmailRequest $request): JsonResponse
    {
        $this->authService->verifyEmail($request->toDTO());

        return ResponseHelper::success(null, 'Email verified successfully.');
    }

    /**
     * Resend verification email.
     *
     * @param ResendVerificationRequest $request
     * @return JsonResponse
     */
    public function resendVerification(ResendVerificationRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $this->authService->resendVerification($user);

        return ResponseHelper::success(null, 'Verification email sent successfully.');
    }

    /**
     * List active sessions.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function sessions(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $sessions = $this->authService->getSessions($user);

        return ResponseHelper::success(CustomerSessionResource::collection($sessions), 'Sessions retrieved successfully.');
    }

    /**
     * Revoke a specific session.
     *
     * @param Request $request
     * @param string $id
     * @return JsonResponse
     */
    public function revokeSession(Request $request, string $id): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $this->authService->revokeSession($user, $id);

        return ResponseHelper::success(null, 'Session revoked successfully.');
    }
}
