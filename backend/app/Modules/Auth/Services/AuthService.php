<?php

declare(strict_types=1);

namespace App\Modules\Auth\Services;

use App\Core\Abstracts\AbstractService;
use App\Core\Exceptions\AuthenticationException;
use App\Core\Exceptions\AuthorizationException;
use App\Core\Exceptions\BusinessRuleException;
use App\Core\Exceptions\EntityNotFoundException;
use App\Modules\Auth\Contracts\AuthServiceInterface;
use App\Modules\Auth\Contracts\UserRepositoryInterface;
use App\Modules\Auth\DTOs\ChangePasswordDTO;
use App\Modules\Auth\DTOs\ForgotPasswordDTO;
use App\Modules\Auth\DTOs\LoginUserDTO;
use App\Modules\Auth\DTOs\RegisterUserDTO;
use App\Modules\Auth\DTOs\ResetPasswordDTO;
use App\Modules\Auth\DTOs\UpdateProfileDTO;
use App\Modules\Auth\DTOs\VerifyEmailDTO;
use App\Modules\Auth\Events\PasswordReset as PasswordResetEvent;
use App\Modules\Auth\Events\UserLoggedIn;
use App\Modules\Auth\Events\UserLoggedOut;
use App\Modules\Auth\Events\UserRegistered;
use App\Modules\Auth\Models\CustomerProfile;
use App\Modules\Auth\Models\CustomerSession;
use App\Modules\Auth\Models\Role;
use App\Modules\Auth\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * Class AuthService
 *
 * Enterprise Authentication & Identity Domain Service.
 *
 * @package App\Modules\Auth\Services
 */
class AuthService extends AbstractService implements AuthServiceInterface
{
    /**
     * AuthService constructor.
     *
     * @param UserRepositoryInterface $userRepository
     */
    public function __construct(
        protected readonly UserRepositoryInterface $userRepository
    ) {
    }

    /**
     * @inheritDoc
     */
    public function register(RegisterUserDTO $dto): array
    {
        return $this->executeInTransaction(function () use ($dto) {
            $existing = $this->userRepository->findByEmail($dto->email);
            if ($existing) {
                throw new BusinessRuleException('A user with this email address already exists.', 422, 'DUPLICATE_EMAIL');
            }

            /** @var User $user */
            $user = $this->userRepository->create([
                'first_name' => $dto->first_name,
                'last_name' => $dto->last_name,
                'email' => $dto->email,
                'password' => Hash::make($dto->password),
                'phone' => $dto->phone,
                'user_type' => 'customer',
                'is_active' => true,
                'email_verified_at' => null,
            ]);

            // Assign customer role if exists
            $customerRole = Role::where('name', 'customer')->first();
            if ($customerRole) {
                $user->assignRole($customerRole);
            }

            // Create initial customer profile
            CustomerProfile::create([
                'user_id' => $user->id,
                'customer_group' => 'regular',
                'loyalty_points' => 0,
            ]);

            $expiresAt = now()->addMinutes(60);
            $tokenResult = $user->createToken('auth_token', ['*'], $expiresAt);

            $this->dispatchDomainEvent(new UserRegistered($user));

            return [
                'user' => $user->load(['customerProfile', 'roles']),
                'token' => [
                    'access_token' => $tokenResult->plainTextToken,
                    'token_type' => 'Bearer',
                    'expires_at' => $expiresAt->toIso8601String(),
                ],
            ];
        });
    }

    /**
     * @inheritDoc
     */
    public function login(LoginUserDTO $dto, ?string $ip = null): array
    {
        $user = $this->userRepository->findByEmail($dto->email);

        if (! $user || ! Hash::check($dto->password, $user->password)) {
            throw new AuthenticationException('Invalid email or password.');
        }

        if (! $user->isActive()) {
            throw new AuthorizationException('Your account is currently disabled. Please contact customer support.');
        }

        $clientIp = $ip ?? request()->ip() ?? '127.0.0.1';
        $userAgent = request()->userAgent();

        // Update login stats
        $this->userRepository->updateLastLogin($user->id, $clientIp);

        // Record customer session
        CustomerSession::create([
            'user_id' => $user->id,
            'session_token' => Str::random(60),
            'ip_address' => $clientIp,
            'user_agent' => $userAgent,
            'device_type' => $this->detectDeviceType($userAgent),
            'last_activity_at' => now(),
            'expires_at' => now()->addMinutes(60),
        ]);

        $expiresAt = now()->addMinutes(60);
        $tokenResult = $user->createToken($dto->device_name, ['*'], $expiresAt);

        $this->dispatchDomainEvent(new UserLoggedIn($user, $clientIp, $userAgent));

        $permissions = $user->getAllPermissions()->pluck('name')->toArray();

        return [
            'user' => $user->load(['customerProfile', 'staffProfile', 'roles']),
            'token' => [
                'access_token' => $tokenResult->plainTextToken,
                'token_type' => 'Bearer',
                'expires_at' => $expiresAt->toIso8601String(),
            ],
            'permissions' => $permissions,
        ];
    }

    /**
     * @inheritDoc
     */
    public function logout(User $user): void
    {
        $currentToken = $user->currentAccessToken();
        if ($currentToken) {
            $currentToken->delete();
        }

        $this->dispatchDomainEvent(new UserLoggedOut($user));
    }

    /**
     * @inheritDoc
     */
    public function refreshToken(User $user): array
    {
        $currentToken = $user->currentAccessToken();
        if ($currentToken) {
            $currentToken->delete();
        }

        $expiresAt = now()->addMinutes(60);
        $tokenResult = $user->createToken('auth_token', ['*'], $expiresAt);

        return [
            'access_token' => $tokenResult->plainTextToken,
            'token_type' => 'Bearer',
            'expires_at' => $expiresAt->toIso8601String(),
        ];
    }

    /**
     * @inheritDoc
     */
    public function me(User $user): User
    {
        return $user->load(['customerProfile', 'staffProfile', 'roles.permissions', 'permissions']);
    }

    /**
     * @inheritDoc
     */
    public function updateProfile(User $user, UpdateProfileDTO $dto): User
    {
        return $this->executeInTransaction(function () use ($user, $dto) {
            $userAttributes = array_filter([
                'first_name' => $dto->first_name,
                'last_name' => $dto->last_name,
                'phone' => $dto->phone,
                'avatar' => $dto->avatar,
                'locale' => $dto->locale,
                'timezone' => $dto->timezone,
            ], fn ($v) => $v !== null);

            if (! empty($userAttributes)) {
                $user->update($userAttributes);
            }

            if ($user->isCustomer()) {
                $profileAttributes = array_filter([
                    'date_of_birth' => $dto->date_of_birth,
                    'gender' => $dto->gender,
                    'company' => $dto->company,
                    'tax_id' => $dto->tax_id,
                ], fn ($v) => $v !== null);

                if (! empty($profileAttributes)) {
                    CustomerProfile::updateOrCreate(
                        ['user_id' => $user->id],
                        $profileAttributes
                    );
                }
            }

            return $user->fresh(['customerProfile', 'staffProfile', 'roles']);
        });
    }

    /**
     * @inheritDoc
     */
    public function changePassword(User $user, ChangePasswordDTO $dto): void
    {
        if (! Hash::check($dto->current_password, $user->password)) {
            throw new BusinessRuleException('The provided current password does not match our records.', 422, 'INVALID_PASSWORD');
        }

        $user->update(['password' => Hash::make($dto->new_password)]);

        $this->dispatchDomainEvent(new PasswordResetEvent($user));
    }

    /**
     * @inheritDoc
     */
    public function forgotPassword(ForgotPasswordDTO $dto): void
    {
        $user = $this->userRepository->findByEmail($dto->email);

        if (! $user) {
            return; // Silent return to prevent account enumeration
        }

        $token = Str::random(64);

        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $user->email],
            [
                'token' => Hash::make($token),
                'created_at' => now(),
            ]
        );
    }

    /**
     * @inheritDoc
     */
    public function resetPassword(ResetPasswordDTO $dto): void
    {
        $record = DB::table('password_reset_tokens')
            ->where('email', $dto->email)
            ->first();

        if (! $record) {
            throw new BusinessRuleException('Invalid password reset request.', 422, 'INVALID_TOKEN');
        }

        if (! Hash::check($dto->token, $record->token)) {
            throw new BusinessRuleException('Invalid password reset token.', 422, 'INVALID_TOKEN');
        }

        if ($record->created_at && now()->diffInMinutes($record->created_at) > 60) {
            DB::table('password_reset_tokens')->where('email', $dto->email)->delete();
            throw new BusinessRuleException('Password reset token has expired.', 422, 'EXPIRED_TOKEN');
        }

        $user = $this->userRepository->findByEmail($dto->email);
        if (! $user) {
            throw new EntityNotFoundException('User', $dto->email);
        }

        $user->update(['password' => Hash::make($dto->password)]);
        DB::table('password_reset_tokens')->where('email', $dto->email)->delete();

        $this->dispatchDomainEvent(new PasswordResetEvent($user));
    }

    /**
     * @inheritDoc
     */
    public function verifyEmail(VerifyEmailDTO $dto): void
    {
        if ($dto->email) {
            $user = $this->userRepository->findByEmail($dto->email);
        } else {
            // Find by token or current user
            $user = auth()->user();
        }

        if (! $user) {
            throw new EntityNotFoundException('User', 'verification');
        }

        if ($user->hasVerifiedEmail()) {
            return;
        }

        $user->markEmailAsVerified();
    }

    /**
     * @inheritDoc
     */
    public function resendVerification(User $user): void
    {
        if ($user->hasVerifiedEmail()) {
            throw new BusinessRuleException('Email is already verified.', 422, 'EMAIL_ALREADY_VERIFIED');
        }

        $user->sendEmailVerificationNotification();
    }

    /**
     * @inheritDoc
     */
    public function getSessions(User $user): Collection
    {
        return CustomerSession::where('user_id', $user->id)
            ->orderByDesc('last_activity_at')
            ->get();
    }

    /**
     * @inheritDoc
     */
    public function revokeSession(User $user, string $sessionId): void
    {
        $session = CustomerSession::where('user_id', $user->id)
            ->where('id', $sessionId)
            ->first();

        if (! $session) {
            throw new EntityNotFoundException('Session', $sessionId);
        }

        $session->delete();
    }

    /**
     * Detect device type from user agent string.
     *
     * @param string|null $userAgent
     * @return string
     */
    private function detectDeviceType(?string $userAgent): string
    {
        if (! $userAgent) {
            return 'desktop';
        }

        if (preg_match('/(tablet|ipad|playbook)|(android(?!.*(mobi|opera mini)))/i', $userAgent)) {
            return 'tablet';
        }

        if (preg_match('/(iphone|ipod|blackberry|android|mobile|opera mini)/i', $userAgent)) {
            return 'mobile';
        }

        return 'desktop';
    }
}
