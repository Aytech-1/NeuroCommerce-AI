<?php

declare(strict_types=1);

namespace App\Modules\Notification\Models;

use App\Core\Traits\Filterable;
use App\Core\Traits\HasUuid;
use App\Core\Traits\Sortable;
use App\Modules\Auth\Models\User;
use App\Modules\Notification\Database\Factories\NotificationFactory;
use App\Modules\Notification\Enums\DeliveryStatus;
use App\Modules\Notification\Enums\NotificationChannel;
use App\Modules\Notification\Enums\NotificationType;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Class Notification
 *
 * @property string $id
 * @property string $user_id
 * @property string $type
 * @property NotificationChannel $channel
 * @property string $title
 * @property string|null $body
 * @property array|null $data
 * @property DeliveryStatus $status
 * @property \Carbon\Carbon|null $read_at
 * @property \Carbon\Carbon|null $sent_at
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 *
 * @property-read User $user
 *
 * @package App\Modules\Notification\Models
 */
class Notification extends Model
{
    use HasFactory;
    use HasUuid;
    use Filterable;
    use Sortable;

    protected $table = 'notifications';

    protected $fillable = [
        'user_id',
        'type',
        'channel',
        'title',
        'body',
        'data',
        'status',
        'read_at',
        'sent_at',
    ];

    protected $casts = [
        'channel' => NotificationChannel::class,
        'status' => DeliveryStatus::class,
        'data' => 'array',
        'read_at' => 'datetime',
        'sent_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function scopeUnread(Builder $query): Builder
    {
        return $query->whereNull('read_at');
    }

    public function scopeRead(Builder $query): Builder
    {
        return $query->whereNotNull('read_at');
    }

    public function scopeChannel(Builder $query, NotificationChannel|string $channel): Builder
    {
        $val = $channel instanceof NotificationChannel ? $channel->value : $channel;
        return $query->where('channel', $val);
    }

    public function scopeType(Builder $query, NotificationType|string $type): Builder
    {
        $val = $type instanceof NotificationType ? $type->value : $type;
        return $query->where('type', $val);
    }

    public function isRead(): bool
    {
        return $this->read_at !== null;
    }

    public function markAsRead(): bool
    {
        if ($this->isRead()) {
            return true;
        }

        return $this->update([
            'read_at' => now(),
            'status' => DeliveryStatus::READ,
        ]);
    }

    protected static function newFactory(): NotificationFactory
    {
        return NotificationFactory::new();
    }
}
