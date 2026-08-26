<?php

declare(strict_types=1);

namespace App\Modules\Auth\Services;

use App\Core\Abstracts\AbstractService;
use App\Core\Exceptions\BusinessRuleException;
use App\Core\Exceptions\EntityNotFoundException;
use App\Modules\Auth\Contracts\RoleRepositoryInterface;
use App\Modules\Auth\Contracts\RoleServiceInterface;
use App\Modules\Auth\Models\Permission;
use App\Modules\Auth\Models\Role;
use Illuminate\Database\Eloquent\Collection;

/**
 * Class RoleService
 *
 * RBAC and Role/Permission domain service.
 *
 * @package App\Modules\Auth\Services
 */
class RoleService extends AbstractService implements RoleServiceInterface
{
    /**
     * RoleService constructor.
     *
     * @param RoleRepositoryInterface $roleRepository
     */
    public function __construct(
        protected readonly RoleRepositoryInterface $roleRepository
    ) {
    }

    /**
     * @inheritDoc
     */
    public function listRoles(): Collection
    {
        return $this->roleRepository->getAllWithPermissions();
    }

    /**
     * @inheritDoc
     */
    public function getRoleById(string $id): Role
    {
        /** @var Role|null $role */
        $role = Role::with('permissions')->find($id);

        if (! $role) {
            throw new EntityNotFoundException('Role', $id);
        }

        return $role;
    }

    /**
     * @inheritDoc
     */
    public function createRole(array $data): Role
    {
        return $this->executeInTransaction(function () use ($data) {
            $existing = $this->roleRepository->findByName($data['name']);
            if ($existing) {
                throw new BusinessRuleException('A role with this name already exists.', 422, 'DUPLICATE_ROLE');
            }

            /** @var Role $role */
            $role = $this->roleRepository->create([
                'name' => $data['name'],
                'guard_name' => $data['guard_name'] ?? 'api',
                'description' => $data['description'] ?? null,
                'is_system' => false,
            ]);

            if (! empty($data['permissions'])) {
                $role->syncPermissions($data['permissions']);
            }

            return $role->load('permissions');
        });
    }

    /**
     * @inheritDoc
     */
    public function updateRole(string $id, array $data): Role
    {
        return $this->executeInTransaction(function () use ($id, $data) {
            $role = $this->getRoleById($id);

            $attributes = array_filter([
                'name' => $data['name'] ?? null,
                'description' => $data['description'] ?? null,
            ], fn ($v) => $v !== null);

            if (! empty($attributes)) {
                $role->update($attributes);
            }

            return $role->fresh('permissions');
        });
    }

    /**
     * @inheritDoc
     */
    public function deleteRole(string $id): bool
    {
        $role = $this->getRoleById($id);

        if ($role->is_system) {
            throw new BusinessRuleException('System roles cannot be deleted.', 422, 'SYSTEM_ROLE_PROTECTED');
        }

        return (bool) $role->delete();
    }

    /**
     * @inheritDoc
     */
    public function syncPermissions(string $roleId, array $permissions): Role
    {
        $role = $this->getRoleById($roleId);
        $role->syncPermissions($permissions);

        return $role->fresh('permissions');
    }

    /**
     * @inheritDoc
     */
    public function listPermissionsGrouped(): array
    {
        $permissions = Permission::all();

        return $permissions->groupBy('module')->toArray();
    }
}
