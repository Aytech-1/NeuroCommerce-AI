<?php

declare(strict_types=1);

namespace App\Modules\Auth\Contracts;

use App\Core\Contracts\BaseRepositoryInterface;
use App\Modules\Auth\Models\Role;
use Illuminate\Database\Eloquent\Collection;

/**
 * Interface RoleRepositoryInterface
 *
 * @package App\Modules\Auth\Contracts
 */
interface RoleRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Find a role by its name.
     *
     * @param string $name
     * @param string $guard
     * @return Role|null
     */
    public function findByName(string $name, string $guard = 'api'): ?Role;

    /**
     * Sync permissions to a role.
     *
     * @param string $roleId
     * @param array<int, string> $permissions
     * @return Role
     */
    public function syncPermissions(string $roleId, array $permissions): Role;

    /**
     * Get all non-system or system roles with permission counts.
     *
     * @return Collection
     */
    public function getAllWithPermissions(): Collection;
}
