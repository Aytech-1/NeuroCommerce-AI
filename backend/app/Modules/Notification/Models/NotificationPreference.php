<?php

declare(strict_types=1);

namespace App\Modules\Notification\Models;

use App\Modules\Auth\Models\User;
use App\Modules\Notification\Database\Factories\NotificationPreferenceFactory;
use App\Modules\Notification\Enums\NotificationChannel;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Class NotificationPreference
 *
 * @property string $user_id
 * @property NotificationChannel $channel
 * @property string $notification_type
 * @property bool $is_enabled
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 *
 * @property-read User $user
 *
 * @package App\Modules\Notification\Models
 */
class NotificationPreference extends Model
{
    use HasFactory;

    protected $table = 'notif_preferences';

    public $incrementing = false;
    protected $primaryKey = ['user_id', 'channel', 'notification_type'];
    protected $keyType = 'string';

    protected $fillable = [
        'user_id',
        'channel',
        'notification_type',
        'is_enabled',
    ];

    protected $casts = [
        'channel' => NotificationChannel::class,
        'is_enabled' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Set the keys for a save update query.
     */
    protected function setKeysForSaveQuery($query)
    {
        return $query
            ->where('user_id', $this->getAttribute('user_id'))
            ->where('channel', $this->getAttribute('channel') instanceof NotificationChannel ? $this->getAttribute('channel')->value : $this->getAttribute('channel'))
            ->where('notification_type', $this->getAttribute('notification_type'));
    }

    protected static function newFactory(): NotificationPreferenceFactory
    {
        return NotificationPreferenceFactory::new();
    }
}
