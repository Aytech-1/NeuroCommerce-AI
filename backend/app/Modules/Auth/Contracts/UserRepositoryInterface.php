<?php

declare(strict_types=1);

namespace App\Modules\Auth\Contracts;

use App\Core\Contracts\BaseRepositoryInterface;
use App\Modules\Auth\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * Interface UserRepositoryInterface
 *
 * @package App\Modules\Auth\Contracts
 */
interface UserRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Find a user by their email address.
     *
     * @param string $email
     * @return User|null
     */
    public function findByEmail(string $email): ?User;

    /**
     * Find an active user by their ID.
     *
     * @param string $id
     * @return User|null
     */
    public function findActiveById(string $id): ?User;

    /**
     * Create a user along with an optional customer or staff profile.
     *
     * @param array $userData
     * @param array $profileData
     * @return User
     */
    public function createWithProfile(array $userData, array $profileData = []): User;

    /**
     * Update user password.
     *
     * @param string $userId
     * @param string $hashedPassword
     * @return bool
     */
    public function updatePassword(string $userId, string $hashedPassword): bool;

    /**
     * Update last login timestamp and IP address.
     *
     * @param string $userId
     * @param string $ip
     * @return void
     */
    public function updateLastLogin(string $userId, string $ip): void;

    /**
     * Search users with flexible filtering and pagination.
     *
     * @param array $filters
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function searchUsers(array $filters = [], int $perPage = 20): LengthAwarePaginator;
}
