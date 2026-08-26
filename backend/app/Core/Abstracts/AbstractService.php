<?php

declare(strict_types=1);

namespace App\Core\Abstracts;

use Illuminate\Support\Facades\DB;
use Closure;

/**
 * Class AbstractService
 *
 * Base service class with DB transaction wrapper and event dispatching.
 *
 * @package App\Core\Abstracts
 * @author NeuroCommerce AI
 * @since 1.0.0
 * @copyright 2026 NeuroCommerce AI
 */
abstract class AbstractService
{
    /**
     * Execute a callback within a database transaction.
     *
     * @param Closure $callback
     * @return mixed
     * @throws \Throwable
     */
    protected function executeInTransaction(Closure $callback): mixed
    {
        return DB::transaction($callback);
    }

    /**
     * Dispatch a domain event.
     *
     * @param object $event
     * @return void
     */
    protected function dispatchDomainEvent(object $event): void
    {
        event($event);
    }

    /**
     * Log activity related to an action.
     *
     * @param string $action
     * @param string $description
     * @param array|null $properties
     * @return void
     */
    protected function logActivity(string $action, string $description, ?array $properties = null): void
    {
        // Integration point for activity logging (e.g., spatie/laravel-activitylog)
    }
}
