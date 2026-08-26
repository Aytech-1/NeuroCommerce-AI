<?php

declare(strict_types=1);

namespace App\Modules\Notification\Resources;

use App\Modules\Notification\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Class NotificationResource
 *
 * @mixin Notification
 * @package App\Modules\Notification\Resources
 */
class NotificationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'type' => $this->type,
            'channel' => $this->channel->value,
            'title' => $this->title,
            'body' => $this->body,
            'data' => $this->data,
            'status' => $this->status->value,
            'is_read' => $this->isRead(),
            'read_at' => $this->read_at?->toISOString(),
            'sent_at' => $this->sent_at?->toISOString(),
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
        ];
    }
}
