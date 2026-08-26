<?php

declare(strict_types=1);

namespace App\Modules\Admin\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Class AuditLogResource
 *
 * @package App\Modules\Admin\Resources
 */
class AuditLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'user_id' => (string) $this->user_id,
            'user' => $this->whenLoaded('user', function () {
                return [
                    'id' => (string) $this->user->id,
                    'name' => "{$this->user->first_name} {$this->user->last_name}",
                    'email' => (string) $this->user->email,
                ];
            }),
            'event' => (string) $this->event,
            'auditable_type' => (string) $this->auditable_type,
            'auditable_id' => (string) $this->auditable_id,
            'old_values' => $this->old_values,
            'new_values' => $this->new_values,
            'ip_address' => $this->ip_address,
            'user_agent' => $this->user_agent,
            'tags' => $this->tags,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
