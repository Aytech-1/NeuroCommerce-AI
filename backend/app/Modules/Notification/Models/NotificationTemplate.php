<?php

declare(strict_types=1);

namespace App\Modules\Notification\Models;

use App\Core\Traits\Filterable;
use App\Core\Traits\HasUuid;
use App\Core\Traits\Sortable;
use App\Modules\Notification\Database\Factories\NotificationTemplateFactory;
use App\Modules\Notification\Enums\NotificationChannel;
use App\Modules\Notification\Enums\NotificationType;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Class NotificationTemplate
 *
 * @property string $id
 * @property string $name
 * @property NotificationChannel $channel
 * @property string $notification_type
 * @property string|null $subject
 * @property string $body_template
 * @property array|null $variables
 * @property bool $is_active
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 *
 * @package App\Modules\Notification\Models
 */
class NotificationTemplate extends Model
{
    use HasFactory;
    use HasUuid;
    use Filterable;
    use Sortable;

    protected $table = 'notif_templates';

    protected $fillable = [
        'name',
        'channel',
        'notification_type',
        'subject',
        'body_template',
        'variables',
        'is_active',
    ];

    protected $casts = [
        'channel' => NotificationChannel::class,
        'variables' => 'array',
        'is_active' => 'boolean',
    ];

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeChannel(Builder $query, NotificationChannel|string $channel): Builder
    {
        $val = $channel instanceof NotificationChannel ? $channel->value : $channel;
        return $query->where('channel', $val);
    }

    public function scopeType(Builder $query, NotificationType|string $type): Builder
    {
        $val = $type instanceof NotificationType ? $type->value : $type;
        return $query->where('notification_type', $val);
    }

    protected static function newFactory(): NotificationTemplateFactory
    {
        return NotificationTemplateFactory::new();
    }
}
