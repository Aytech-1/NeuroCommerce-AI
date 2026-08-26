<?php

declare(strict_types=1);

namespace App\Modules\Auth\Contracts;

use App\Modules\Auth\Models\Role;
use Illuminate\Database\Eloquent\Collection;

/**
 * Interface RoleServiceInterface
 *
 * @package App\Modules\Auth\Contracts
 */
interface RoleServiceInterface
{
    /**
     * List all roles.
     *
     * @return Collection
     */
    public function listRoles(): Collection;

    /**
     * Get role by ID.
     *
     * @param string $id
     * @return Role
     */
    public function getRoleById(string $id): Role;

    /**
     * Create a new role.
     *
     * @param array $data
     * @return Role
     */
    public function createRole(array $data): Role;

    /**
     * Update an existing non-system role.
     *
     * @param string $id
     * @param array $data
     * @return Role
     */
    public function updateRole(string $id, array $data): Role;

    /**
     * Delete a non-system role.
     *
     * @param string $id
     * @return bool
     */
    public function deleteRole(string $id): bool;

    /**
     * Sync permissions to a role.
     *
     * @param string $roleId
     * @param array<int, string> $permissions
     * @return Role
     */
    public function syncPermissions(string $roleId, array $permissions): Role;

    /**
     * List all permissions grouped by module.
     *
     * @return array<string, mixed>
     */
    public function listPermissionsGrouped(): array;
}
