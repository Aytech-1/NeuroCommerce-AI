<?php

declare(strict_types=1);

namespace App\Modules\Admin\Services;

use App\Modules\Admin\Models\AuditActivityLog;
use App\Modules\Admin\Models\AuditLog;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

/**
 * Class AuditLogService
 *
 * @package App\Modules\Admin\Services
 */
class AuditLogService
{
    public function log(
        string $event,
        string $auditableType,
        string $auditableId,
        ?array $oldValues = null,
        ?array $newValues = null,
        ?string $userId = null,
        ?string $ipAddress = null,
        ?string $userAgent = null,
        ?array $tags = null
    ): AuditLog {
        return AuditLog::create([
            'user_id' => $userId,
            'event' => $event,
            'auditable_type' => $auditableType,
            'auditable_id' => $auditableId,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent,
            'tags' => $tags,
        ]);
    }

    public function logActivity(
        string $action,
        ?string $description = null,
        ?array $properties = null,
        ?string $userId = null,
        ?string $ipAddress = null
    ): AuditActivityLog {
        return AuditActivityLog::create([
            'user_id' => $userId,
            'action' => $action,
            'description' => $description,
            'properties' => $properties,
            'ip_address' => $ipAddress,
        ]);
    }

    public function getAuditLogs(array $filters = [], int $perPage = 50): LengthAwarePaginator
    {
        $query = AuditLog::query()->with('user:id,first_name,last_name,email')->latest('created_at');

        if (!empty($filters['event'])) {
            $query->where('event', $filters['event']);
        }

        if (!empty($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        if (!empty($filters['auditable_type'])) {
            $query->where('auditable_type', $filters['auditable_type']);
        }

        if (!empty($filters['auditable_id'])) {
            $query->where('auditable_id', $filters['auditable_id']);
        }

        if (!empty($filters['date_from'])) {
            $query->where('created_at', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->where('created_at', '<=', $filters['date_to']);
        }

        return $query->paginate($perPage);
    }

    public function getActivityLogs(array $filters = [], int $perPage = 50): LengthAwarePaginator
    {
        $query = AuditActivityLog::query()->with('user:id,first_name,last_name,email')->latest('created_at');

        if (!empty($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        if (!empty($filters['action'])) {
            $query->where('action', $filters['action']);
        }

        return $query->paginate($perPage);
    }
}
