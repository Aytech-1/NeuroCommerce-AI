<?php

declare(strict_types=1);

namespace App\Modules\Auth\Services;

use App\Core\Abstracts\AbstractService;
use App\Core\Exceptions\BusinessRuleException;
use App\Core\Exceptions\EntityNotFoundException;
use App\Modules\Auth\Contracts\AddressRepositoryInterface;
use App\Modules\Auth\Contracts\UserRepositoryInterface;
use App\Modules\Auth\Contracts\UserServiceInterface;
use App\Modules\Auth\DTOs\AddressDTO;
use App\Modules\Auth\Events\AccountDeactivated;
use App\Modules\Auth\Models\Address;
use App\Modules\Auth\Models\CustomerProfile;
use App\Modules\Auth\Models\StaffProfile;
use App\Modules\Auth\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Hash;

/**
 * Class UserService
 *
 * Domain service for User entity management and Address operations.
 *
 * @package App\Modules\Auth\Services
 */
class UserService extends AbstractService implements UserServiceInterface
{
    /**
     * UserService constructor.
     *
     * @param UserRepositoryInterface $userRepository
     * @param AddressRepositoryInterface $addressRepository
     */
    public function __construct(
        protected readonly UserRepositoryInterface $userRepository,
        protected readonly AddressRepositoryInterface $addressRepository
    ) {
    }

    /**
     * @inheritDoc
     */
    public function listUsers(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        return $this->userRepository->searchUsers($filters, $perPage);
    }

    /**
     * @inheritDoc
     */
    public function getUserById(string $id): User
    {
        /** @var User|null $user */
        $user = User::withTrashed()
            ->with(['roles.permissions', 'permissions', 'customerProfile', 'staffProfile', 'addresses'])
            ->find($id);

        if (! $user) {
            throw new EntityNotFoundException('User', $id);
        }

        return $user;
    }

    /**
     * @inheritDoc
     */
    public function createUser(array $data): User
    {
        return $this->executeInTransaction(function () use ($data) {
            $existing = $this->userRepository->findByEmail($data['email']);
            if ($existing) {
                throw new BusinessRuleException('A user with this email address already exists.', 422, 'DUPLICATE_EMAIL');
            }

            /** @var User $user */
            $user = $this->userRepository->create([
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'],
                'email' => strtolower(trim((string) $data['email'])),
                'password' => Hash::make($data['password']),
                'phone' => $data['phone'] ?? null,
                'user_type' => $data['user_type'] ?? 'customer',
                'is_active' => $data['is_active'] ?? true,
                'email_verified_at' => now(),
            ]);

            if (! empty($data['roles'])) {
                $user->syncRoles($data['roles']);
            }

            if (in_array($user->user_type, ['staff', 'admin', 'super_admin'], true)) {
                StaffProfile::create([
                    'user_id' => $user->id,
                    'employee_id' => $data['employee_id'] ?? 'EMP-' . strtoupper(substr(uniqid(), -6)),
                    'department' => $data['department'] ?? null,
                    'position' => $data['position'] ?? null,
                    'hire_date' => now(),
                ]);
            } else {
                CustomerProfile::create([
                    'user_id' => $user->id,
                    'customer_group' => $data['customer_group'] ?? 'regular',
                    'loyalty_points' => 0,
                ]);
            }

            return $this->getUserById($user->id);
        });
    }

    /**
     * @inheritDoc
     */
    public function updateUser(string $id, array $data): User
    {
        return $this->executeInTransaction(function () use ($id, $data) {
            $user = $this->getUserById($id);

            $userAttributes = array_filter([
                'first_name' => $data['first_name'] ?? null,
                'last_name' => $data['last_name'] ?? null,
                'email' => isset($data['email']) ? strtolower(trim((string) $data['email'])) : null,
                'phone' => $data['phone'] ?? null,
                'user_type' => $data['user_type'] ?? null,
                'is_active' => $data['is_active'] ?? null,
                'locale' => $data['locale'] ?? null,
                'timezone' => $data['timezone'] ?? null,
            ], fn ($v) => $v !== null);

            if (! empty($userAttributes)) {
                $user->update($userAttributes);
            }

            if ($user->staffProfile) {
                $staffAttributes = array_filter([
                    'department' => $data['department'] ?? null,
                    'position' => $data['position'] ?? null,
                ], fn ($v) => $v !== null);

                if (! empty($staffAttributes)) {
                    $user->staffProfile->update($staffAttributes);
                }
            }

            if ($user->customerProfile) {
                $customerAttributes = array_filter([
                    'customer_group' => $data['customer_group'] ?? null,
                    'loyalty_points' => $data['loyalty_points'] ?? null,
                ], fn ($v) => $v !== null);

                if (! empty($customerAttributes)) {
                    $user->customerProfile->update($customerAttributes);
                }
            }

            return $this->getUserById($id);
        });
    }

    /**
     * @inheritDoc
     */
    public function deleteUser(string $id): bool
    {
        $user = $this->getUserById($id);

        if ($user->isSuperAdmin()) {
            throw new BusinessRuleException('Cannot delete a Super Admin user account.', 422, 'SUPER_ADMIN_PROTECTED');
        }

        $user->tokens()->delete();
        $this->dispatchDomainEvent(new AccountDeactivated($user));

        return (bool) $user->delete();
    }

    /**
     * @inheritDoc
     */
    public function restoreUser(string $id): bool
    {
        /** @var User|null $user */
        $user = User::onlyTrashed()->find($id);

        if (! $user) {
            throw new EntityNotFoundException('Deleted User', $id);
        }

        return (bool) $user->restore();
    }

    /**
     * @inheritDoc
     */
    public function updateStatus(string $id, bool $isActive): User
    {
        $user = $this->getUserById($id);

        if ($user->isSuperAdmin() && ! $isActive) {
            throw new BusinessRuleException('Cannot deactivate a Super Admin user account.', 422, 'SUPER_ADMIN_PROTECTED');
        }

        $user->update(['is_active' => $isActive]);

        if (! $isActive) {
            $user->tokens()->delete();
            $this->dispatchDomainEvent(new AccountDeactivated($user));
        }

        return $user;
    }

    /**
     * @inheritDoc
     */
    public function assignRoles(string $id, array $roles): User
    {
        $user = $this->getUserById($id);
        $user->syncRoles($roles);

        return $this->getUserById($id);
    }

    /**
     * @inheritDoc
     */
    public function removeRole(string $id, string $role): User
    {
        $user = $this->getUserById($id);
        $user->removeRole($role);

        return $this->getUserById($id);
    }

    /**
     * @inheritDoc
     */
    public function getUserAddresses(string $userId): Collection
    {
        return $this->addressRepository->getUserAddresses($userId);
    }

    /**
     * @inheritDoc
     */
    public function createAddress(string $userId, AddressDTO $dto): Address
    {
        return $this->executeInTransaction(function () use ($userId, $dto) {
            if ($dto->is_default) {
                Address::where('addressable_type', User::class)
                    ->where('addressable_id', $userId)
                    ->update(['is_default' => false]);
            } else {
                $hasExisting = Address::where('addressable_type', User::class)
                    ->where('addressable_id', $userId)
                    ->exists();

                if (! $hasExisting) {
                    $dto = new AddressDTO(
                        first_name: $dto->first_name,
                        last_name: $dto->last_name,
                        address_line_1: $dto->address_line_1,
                        city: $dto->city,
                        postal_code: $dto->postal_code,
                        country_code: $dto->country_code,
                        address_type: $dto->address_type,
                        label: $dto->label,
                        company: $dto->company,
                        address_line_2: $dto->address_line_2,
                        state_province: $dto->state_province,
                        phone: $dto->phone,
                        is_default: true,
                        latitude: $dto->latitude,
                        longitude: $dto->longitude,
                    );
                }
            }

            /** @var Address $address */
            $address = $this->addressRepository->create([
                'addressable_type' => User::class,
                'addressable_id' => $userId,
                'address_type' => $dto->address_type,
                'label' => $dto->label,
                'first_name' => $dto->first_name,
                'last_name' => $dto->last_name,
                'company' => $dto->company,
                'address_line_1' => $dto->address_line_1,
                'address_line_2' => $dto->address_line_2,
                'city' => $dto->city,
                'state_province' => $dto->state_province,
                'postal_code' => $dto->postal_code,
                'country_code' => $dto->country_code,
                'phone' => $dto->phone,
                'is_default' => $dto->is_default,
                'latitude' => $dto->latitude,
                'longitude' => $dto->longitude,
            ]);

            return $address->load('country');
        });
    }

    /**
     * @inheritDoc
     */
    public function updateAddress(string $userId, string $addressId, AddressDTO $dto): Address
    {
        return $this->executeInTransaction(function () use ($userId, $addressId, $dto) {
            /** @var Address|null $address */
            $address = Address::where('addressable_type', User::class)
                ->where('addressable_id', $userId)
                ->where('id', $addressId)
                ->first();

            if (! $address) {
                throw new EntityNotFoundException('Address', $addressId);
            }

            if ($dto->is_default) {
                Address::where('addressable_type', User::class)
                    ->where('addressable_id', $userId)
                    ->where('id', '!=', $addressId)
                    ->update(['is_default' => false]);
            }

            $address->update(array_filter([
                'first_name' => $dto->first_name,
                'last_name' => $dto->last_name,
                'address_line_1' => $dto->address_line_1,
                'address_line_2' => $dto->address_line_2,
                'city' => $dto->city,
                'state_province' => $dto->state_province,
                'postal_code' => $dto->postal_code,
                'country_code' => $dto->country_code,
                'phone' => $dto->phone,
                'address_type' => $dto->address_type,
                'label' => $dto->label,
                'company' => $dto->company,
                'is_default' => $dto->is_default,
                'latitude' => $dto->latitude,
                'longitude' => $dto->longitude,
            ], fn ($v) => $v !== null));

            return $address->fresh('country');
        });
    }

    /**
     * @inheritDoc
     */
    public function deleteAddress(string $userId, string $addressId): bool
    {
        /** @var Address|null $address */
        $address = Address::where('addressable_type', User::class)
            ->where('addressable_id', $userId)
            ->where('id', $addressId)
            ->first();

        if (! $address) {
            throw new EntityNotFoundException('Address', $addressId);
        }

        return (bool) $address->delete();
    }

    /**
     * @inheritDoc
     */
    public function setDefaultAddress(string $userId, string $addressId): Address
    {
        return $this->addressRepository->setDefaultAddress($userId, $addressId);
    }
}
