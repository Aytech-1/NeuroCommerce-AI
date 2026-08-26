<?php

declare(strict_types=1);

namespace App\Modules\Auth\Repositories;

use App\Core\Abstracts\AbstractRepository;
use App\Modules\Auth\Contracts\UserRepositoryInterface;
use App\Modules\Auth\Models\CustomerProfile;
use App\Modules\Auth\Models\User;
use Illuminate\Cache\CacheManager;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

/**
 * Class EloquentUserRepository
 *
 * Eloquent implementation of UserRepositoryInterface.
 *
 * @package App\Modules\Auth\Repositories
 */
class EloquentUserRepository extends AbstractRepository implements UserRepositoryInterface
{
    /**
     * EloquentUserRepository constructor.
     *
     * @param User $model
     * @param CacheManager|null $cache
     */
    public function __construct(User $model, ?CacheManager $cache = null)
    {
        parent::__construct($model, $cache);
    }

    /**
     * @inheritDoc
     */
    public function findByEmail(string $email): ?User
    {
        /** @var User|null */
        return $this->model->newQuery()
            ->with(['roles', 'permissions', 'customerProfile', 'staffProfile'])
            ->where('email', strtolower(trim($email)))
            ->first();
    }

    /**
     * @inheritDoc
     */
    public function findActiveById(string $id): ?User
    {
        /** @var User|null */
        return $this->model->newQuery()
            ->with(['roles', 'permissions', 'customerProfile', 'staffProfile'])
            ->where('id', $id)
            ->where('is_active', true)
            ->first();
    }

    /**
     * @inheritDoc
     */
    public function createWithProfile(array $userData, array $profileData = []): User
    {
        return DB::transaction(function () use ($userData, $profileData) {
            /** @var User $user */
            $user = $this->model->create($userData);

            if ($user->isCustomer()) {
                $profileData['user_id'] = $user->id;
                CustomerProfile::create($profileData);
            }

            return $user->load(['customerProfile', 'roles']);
        });
    }

    /**
     * @inheritDoc
     */
    public function updatePassword(string $userId, string $hashedPassword): bool
    {
        $user = $this->model->find($userId);

        if (! $user) {
            return false;
        }

        $updated = $user->update(['password' => $hashedPassword]);
        $this->clearCache($userId);

        return (bool) $updated;
    }

    /**
     * @inheritDoc
     */
    public function updateLastLogin(string $userId, string $ip): void
    {
        $this->model->where('id', $userId)->update([
            'last_login_at' => now(),
            'last_login_ip' => $ip,
        ]);

        $this->clearCache($userId);
    }

    /**
     * @inheritDoc
     */
    public function searchUsers(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        $query = $this->model->newQuery()->with(['roles', 'customerProfile']);

        if (! empty($filters['search'])) {
            $search = '%' . trim((string) $filters['search']) . '%';
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', $search)
                    ->orWhere('last_name', 'like', $search)
                    ->orWhere('email', 'like', $search)
                    ->orWhere('phone', 'like', $search);
            });
        }

        if (! empty($filters['user_type'])) {
            $query->where('user_type', $filters['user_type']);
        }

        if (isset($filters['is_active'])) {
            $query->where('is_active', (bool) $filters['is_active']);
        }

        if (! empty($filters['role'])) {
            $query->role($filters['role']);
        }

        $sortField = $filters['sort_by'] ?? 'created_at';
        $sortDirection = ($filters['sort_order'] ?? 'desc') === 'asc' ? 'asc' : 'desc';
        $query->orderBy($sortField, $sortDirection);

        return $query->paginate($perPage);
    }
}
