<?php

declare(strict_types=1);

namespace App\Modules\Notification\Contracts;

use App\Core\Contracts\BaseRepositoryInterface;
use App\Modules\Notification\Models\Notification;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

/**
 * Interface NotificationRepositoryInterface
 *
 * @package App\Modules\Notification\Contracts
 */
interface NotificationRepositoryInterface extends BaseRepositoryInterface
{
    public function getUserNotifications(string $userId, array $filters = [], int $perPage = 20): LengthAwarePaginator;

    public function getUnreadCount(string $userId): int;

    public function markAsRead(string $id, string $userId): bool;

    public function markAllAsRead(string $userId): int;

    public function deleteUser(string $id, string $userId): bool;

    public function existsForUser(string $id, string $userId): bool;
}
