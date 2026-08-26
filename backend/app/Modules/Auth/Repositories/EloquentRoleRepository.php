<?php

declare(strict_types=1);

namespace App\Modules\Auth\Repositories;

use App\Core\Abstracts\AbstractRepository;
use App\Modules\Auth\Contracts\RoleRepositoryInterface;
use App\Modules\Auth\Models\Role;
use Illuminate\Cache\CacheManager;
use Illuminate\Database\Eloquent\Collection;

/**
 * Class EloquentRoleRepository
 *
 * @package App\Modules\Auth\Repositories
 */
class EloquentRoleRepository extends AbstractRepository implements RoleRepositoryInterface
{
    /**
     * EloquentRoleRepository constructor.
     *
     * @param Role $model
     * @param CacheManager|null $cache
     */
    public function __construct(Role $model, ?CacheManager $cache = null)
    {
        parent::__construct($model, $cache);
    }

    /**
     * @inheritDoc
     */
    public function findByName(string $name, string $guard = 'api'): ?Role
    {
        /** @var Role|null */
        return $this->model->newQuery()
            ->where('name', $name)
            ->where('guard_name', $guard)
            ->first();
    }

    /**
     * @inheritDoc
     */
    public function syncPermissions(string $roleId, array $permissions): Role
    {
        /** @var Role $role */
        $role = $this->model->findOrFail($roleId);
        $role->syncPermissions($permissions);

        return $role->load('permissions');
    }

    /**
     * @inheritDoc
     */
    public function getAllWithPermissions(): Collection
    {
        return $this->model->newQuery()
            ->with('permissions')
            ->orderBy('name')
            ->get();
    }
}
