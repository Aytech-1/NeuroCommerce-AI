<?php

declare(strict_types=1);

namespace App\Core\Abstracts;

use App\Core\Contracts\BaseRepositoryInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Cache\CacheManager;

/**
 * Class AbstractRepository
 *
 * Base Eloquent repository implementation with cache-through pattern.
 *
 * @package App\Core\Abstracts
 * @author NeuroCommerce AI
 * @since 1.0.0
 * @copyright 2026 NeuroCommerce AI
 */
abstract class AbstractRepository implements BaseRepositoryInterface
{
    /**
     * The Eloquent model instance.
     *
     * @var Model
     */
    protected Model $model;

    /**
     * The cache manager instance.
     *
     * @var CacheManager|null
     */
    protected ?CacheManager $cache;

    /**
     * AbstractRepository constructor.
     *
     * @param Model $model
     * @param CacheManager|null $cache
     */
    public function __construct(Model $model, ?CacheManager $cache = null)
    {
        $this->model = $model;
        $this->cache = $cache;
    }

    /**
     * @inheritDoc
     */
    public function findById(string $id): ?Model
    {
        if ($this->cache) {
            $cacheKey = $this->getCacheKey($id);
            return $this->cache->remember($cacheKey, 3600, function () use ($id) {
                return $this->model->find($id);
            });
        }

        return $this->model->find($id);
    }

    /**
     * @inheritDoc
     */
    public function findAll(array $criteria = [], int $perPage = 20): LengthAwarePaginator
    {
        $query = $this->model->newQuery();

        foreach ($criteria as $field => $value) {
            $query->where($field, $value);
        }

        return $query->paginate($perPage);
    }

    /**
     * @inheritDoc
     */
    public function create(array $data): Model
    {
        return $this->model->create($data);
    }

    /**
     * @inheritDoc
     */
    public function update(string $id, array $data): Model
    {
        $record = $this->model->findOrFail($id);
        $record->update($data);
        
        $this->clearCache($id);

        return $record;
    }

    /**
     * @inheritDoc
     */
    public function delete(string $id): bool
    {
        $record = $this->model->find($id);
        
        if ($record) {
            $deleted = $record->delete();
            if ($deleted) {
                $this->clearCache($id);
            }
            return (bool)$deleted;
        }

        return false;
    }

    /**
     * @inheritDoc
     */
    public function exists(string $id): bool
    {
        return $this->model->where($this->model->getKeyName(), $id)->exists();
    }

    /**
     * @inheritDoc
     */
    public function count(array $criteria = []): int
    {
        $query = $this->model->newQuery();

        foreach ($criteria as $field => $value) {
            $query->where($field, $value);
        }

        return $query->count();
    }

    /**
     * @inheritDoc
     */
    public function findByField(string $field, mixed $value): Collection
    {
        return $this->model->where($field, $value)->get();
    }

    /**
     * @inheritDoc
     */
    public function findWhere(array $criteria): Collection
    {
        $query = $this->model->newQuery();

        foreach ($criteria as $field => $value) {
            $query->where($field, $value);
        }

        return $query->get();
    }

    /**
     * Generate cache key for a given ID.
     *
     * @param string $id
     * @return string
     */
    protected function getCacheKey(string $id): string
    {
        return sprintf('%s:%s', $this->model->getTable(), $id);
    }

    /**
     * Clear the cache for a given ID.
     *
     * @param string $id
     * @return void
     */
    protected function clearCache(string $id): void
    {
        if ($this->cache) {
            $this->cache->forget($this->getCacheKey($id));
        }
    }
}
