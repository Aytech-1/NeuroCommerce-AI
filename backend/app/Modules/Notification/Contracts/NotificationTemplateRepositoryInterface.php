<?php

declare(strict_types=1);

namespace App\Modules\Notification\Contracts;

use App\Core\Contracts\BaseRepositoryInterface;
use App\Modules\Notification\Enums\NotificationChannel;
use App\Modules\Notification\Enums\NotificationType;
use App\Modules\Notification\Models\NotificationTemplate;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * Interface NotificationTemplateRepositoryInterface
 *
 * @package App\Modules\Notification\Contracts
 */
interface NotificationTemplateRepositoryInterface extends BaseRepositoryInterface
{
    public function findByName(string $name): ?NotificationTemplate;

    public function findByTypeAndChannel(string $type, string $channel): ?NotificationTemplate;

    public function paginateTemplates(array $filters = [], int $perPage = 20): LengthAwarePaginator;

    public function existsByName(string $name, ?string $exceptId = null): bool;
}
