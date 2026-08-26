<?php

declare(strict_types=1);

namespace App\Modules\Notification\Repositories;

use App\Core\Abstracts\AbstractRepository;
use App\Modules\Notification\Contracts\NotificationRepositoryInterface;
use App\Modules\Notification\Enums\DeliveryStatus;
use App\Modules\Notification\Models\Notification;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * Class EloquentNotificationRepository
 *
 * @package App\Modules\Notification\Repositories
 */
class EloquentNotificationRepository extends AbstractRepository implements NotificationRepositoryInterface
{
    public function __construct(Notification $model)
    {
        parent::__construct($model);
    }

    public function getUserNotifications(string $userId, array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        $query = $this->model->newQuery()->where('user_id', $userId);

        if (!empty($filters['unread_only'])) {
            $query->unread();
        }

        if (!empty($filters['channel'])) {
            $query->where('channel', $filters['channel']);
        }

        if (!empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }

    public function getUnreadCount(string $userId): int
    {
        return $this->model->newQuery()
            ->where('user_id', $userId)
            ->unread()
            ->count();
    }

    public function markAsRead(string $id, string $userId): bool
    {
        return (bool) $this->model->newQuery()
            ->where('id', $id)
            ->where('user_id', $userId)
            ->update([
                'read_at' => now(),
                'status' => DeliveryStatus::READ->value,
            ]);
    }

    public function markAllAsRead(string $userId): int
    {
        return $this->model->newQuery()
            ->where('user_id', $userId)
            ->unread()
            ->update([
                'read_at' => now(),
                'status' => DeliveryStatus::READ->value,
            ]);
    }

    public function deleteUser(string $id, string $userId): bool
    {
        return (bool) $this->model->newQuery()
            ->where('id', $id)
            ->where('user_id', $userId)
            ->delete();
    }

    public function existsForUser(string $id, string $userId): bool
    {
        return $this->model->newQuery()
            ->where('id', $id)
            ->where('user_id', $userId)
            ->exists();
    }
}
