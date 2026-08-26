<?php

declare(strict_types=1);

namespace App\Modules\Notification\Resources;

use App\Modules\Notification\Models\NotificationPreference;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Class NotificationPreferenceResource
 *
 * @mixin NotificationPreference
 * @package App\Modules\Notification\Resources
 */
class NotificationPreferenceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'user_id' => $this->user_id,
            'channel' => $this->channel->value,
            'notification_type' => $this->notification_type,
            'is_enabled' => $this->is_enabled,
        ];
    }
}
