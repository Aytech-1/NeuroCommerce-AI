<?php

declare(strict_types=1);

namespace App\Core\Contracts;

/**
 * Interface BaseServiceInterface
 *
 * Base service interface defining standard service operations.
 *
 * @package App\Core\Contracts
 * @author NeuroCommerce AI
 * @since 1.0.0
 * @copyright 2026 NeuroCommerce AI
 */
interface BaseServiceInterface
{
    /**
     * Get an entity by ID.
     *
     * @param string $id
     * @return mixed
     */
    public function getById(string $id): mixed;

    /**
     * Get all entities with optional filtering and pagination.
     *
     * @param array $filters
     * @param int $perPage
     * @return mixed
     */
    public function getAll(array $filters = [], int $perPage = 20): mixed;

    /**
     * Create a new entity.
     *
     * @param array $data
     * @return mixed
     */
    public function create(array $data): mixed;

    /**
     * Update an existing entity.
     *
     * @param string $id
     * @param array $data
     * @return mixed
     */
    public function update(string $id, array $data): mixed;

    /**
     * Delete an entity by ID.
     *
     * @param string $id
     * @return bool
     */
    public function delete(string $id): bool;
}
