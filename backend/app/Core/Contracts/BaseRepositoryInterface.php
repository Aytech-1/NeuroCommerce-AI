<?php

declare(strict_types=1);

namespace App\Core\Contracts;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * Interface BaseRepositoryInterface
 *
 * Base CRUD repository interface used by all module repositories.
 *
 * @package App\Core\Contracts
 * @author NeuroCommerce AI
 * @since 1.0.0
 * @copyright 2026 NeuroCommerce AI
 */
interface BaseRepositoryInterface
{
    /**
     * Find a model by its ID.
     *
     * @param string $id
     * @return Model|null
     */
    public function findById(string $id): ?Model;

    /**
     * Find all models with optional criteria and pagination.
     *
     * @param array $criteria
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function findAll(array $criteria = [], int $perPage = 20): LengthAwarePaginator;

    /**
     * Create a new model instance.
     *
     * @param array $data
     * @return Model
     */
    public function create(array $data): Model;

    /**
     * Update an existing model instance.
     *
     * @param string $id
     * @param array $data
     * @return Model
     */
    public function update(string $id, array $data): Model;

    /**
     * Delete a model instance by ID.
     *
     * @param string $id
     * @return bool
     */
    public function delete(string $id): bool;

    /**
     * Check if a model exists by ID.
     *
     * @param string $id
     * @return bool
     */
    public function exists(string $id): bool;

    /**
     * Count models matching the criteria.
     *
     * @param array $criteria
     * @return int
     */
    public function count(array $criteria = []): int;

    /**
     * Find models by a specific field.
     *
     * @param string $field
     * @param mixed $value
     * @return Collection
     */
    public function findByField(string $field, mixed $value): Collection;

    /**
     * Find models where multiple criteria match.
     *
     * @param array $criteria
     * @return Collection
     */
    public function findWhere(array $criteria): Collection;
}
