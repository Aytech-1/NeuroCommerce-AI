<?php

declare(strict_types=1);

namespace App\Core\Traits;

use OwenIt\Auditing\Auditable as AuditingTrait;

/**
 * Trait Auditable
 *
 * Integrates models with owen-it/laravel-auditing to track changes.
 *
 * @package App\Core\Traits
 * @author NeuroCommerce AI
 * @since 1.0.0
 * @copyright 2026 NeuroCommerce AI
 */
trait Auditable
{
    use AuditingTrait;

    /**
     * Attributes to include in the Audit.
     *
     * @var array<int, string>
     */
    protected array $auditInclude = [];

    /**
     * Should the timestamps be audited?
     *
     * @var bool
     */
    protected bool $auditTimestamps = true;
}
