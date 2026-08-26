<?php

declare(strict_types=1);

namespace App\Modules\Admin\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Class AuditActivityLogResource
 *
 * @package App\Modules\Admin\Resources
 */
class AuditActivityLogResource extends JsonResource
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
            'action' => (string) $this->action,
            'description' => $this->description,
            'properties' => $this->properties,
            'ip_address' => $this->ip_address,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
