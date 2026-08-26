<?php

declare(strict_types=1);

namespace App\Modules\Auth\Contracts;

use App\Modules\Auth\DTOs\AddressDTO;
use App\Modules\Auth\Models\Address;
use App\Modules\Auth\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

/**
 * Interface UserServiceInterface
 *
 * @package App\Modules\Auth\Contracts
 */
interface UserServiceInterface
{
    /**
     * List users with filtering and pagination.
     *
     * @param array $filters
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function listUsers(array $filters = [], int $perPage = 20): LengthAwarePaginator;

    /**
     * Get user details by ID.
     *
     * @param string $id
     * @return User
     */
    public function getUserById(string $id): User;

    /**
     * Create a staff or customer user from admin.
     *
     * @param array $data
     * @return User
     */
    public function createUser(array $data): User;

    /**
     * Update user details from admin.
     *
     * @param string $id
     * @param array $data
     * @return User
     */
    public function updateUser(string $id, array $data): User;

    /**
     * Soft delete user.
     *
     * @param string $id
     * @return bool
     */
    public function deleteUser(string $id): bool;

    /**
     * Restore soft deleted user.
     *
     * @param string $id
     * @return bool
     */
    public function restoreUser(string $id): bool;

    /**
     * Update user active status.
     *
     * @param string $id
     * @param bool $isActive
     * @return User
     */
    public function updateStatus(string $id, bool $isActive): User;

    /**
     * Assign roles to a user.
     *
     * @param string $id
     * @param array<int, string> $roles
     * @return User
     */
    public function assignRoles(string $id, array $roles): User;

    /**
     * Remove role from a user.
     *
     * @param string $id
     * @param string $role
     * @return User
     */
    public function removeRole(string $id, string $role): User;

    /**
     * Get all addresses for a user.
     *
     * @param string $userId
     * @return Collection
     */
    public function getUserAddresses(string $userId): Collection;

    /**
     * Create an address for a user.
     *
     * @param string $userId
     * @param AddressDTO $dto
     * @return Address
     */
    public function createAddress(string $userId, AddressDTO $dto): Address;

    /**
     * Update an address for a user.
     *
     * @param string $userId
     * @param string $addressId
     * @param AddressDTO $dto
     * @return Address
     */
    public function updateAddress(string $userId, string $addressId, AddressDTO $dto): Address;

    /**
     * Delete an address for a user.
     *
     * @param string $userId
     * @param string $addressId
     * @return bool
     */
    public function deleteAddress(string $userId, string $addressId): bool;

    /**
     * Set default address for a user.
     *
     * @param string $userId
     * @param string $addressId
     * @return Address
     */
    public function setDefaultAddress(string $userId, string $addressId): Address;
}
