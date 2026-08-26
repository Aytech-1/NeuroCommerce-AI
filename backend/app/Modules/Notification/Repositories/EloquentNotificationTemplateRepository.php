<?php

declare(strict_types=1);

namespace App\Modules\Notification\Repositories;

use App\Core\Abstracts\AbstractRepository;
use App\Modules\Notification\Contracts\NotificationTemplateRepositoryInterface;
use App\Modules\Notification\Models\NotificationTemplate;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * Class EloquentNotificationTemplateRepository
 *
 * @package App\Modules\Notification\Repositories
 */
class EloquentNotificationTemplateRepository extends AbstractRepository implements NotificationTemplateRepositoryInterface
{
    public function __construct(NotificationTemplate $model)
    {
        parent::__construct($model);
    }

    public function findByName(string $name): ?NotificationTemplate
    {
        /** @var NotificationTemplate|null */
        return $this->model->newQuery()->where('name', $name)->first();
    }

    public function findByTypeAndChannel(string $type, string $channel): ?NotificationTemplate
    {
        /** @var NotificationTemplate|null */
        return $this->model->newQuery()
            ->where('notification_type', $type)
            ->where('channel', $channel)
            ->where('is_active', true)
            ->first();
    }

    public function paginateTemplates(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        $query = $this->model->newQuery();

        if (isset($filters['is_active'])) {
            $query->where('is_active', (bool) $filters['is_active']);
        }

        if (!empty($filters['channel'])) {
            $query->where('channel', $filters['channel']);
        }

        if (!empty($filters['notification_type'])) {
            $query->where('notification_type', $filters['notification_type']);
        }

        if (!empty($filters['search'])) {
            $search = '%' . $filters['search'] . '%';
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', $search)
                  ->orWhere('subject', 'like', $search);
            });
        }

        return $query->orderBy('name')->paginate($perPage);
    }

    public function existsByName(string $name, ?string $exceptId = null): bool
    {
        $query = $this->model->newQuery()->where('name', $name);

        if ($exceptId !== null) {
            $query->where('id', '!=', $exceptId);
        }

        return $query->exists();
    }
}
