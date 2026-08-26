<?php

declare(strict_types=1);

namespace App\Modules\AI\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Class AIBehaviorEventResource
 *
 * @package App\Modules\AI\Resources
 */
class AIBehaviorEventResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'event_type' => (string) $this->event_type,
            'user_id' => $this->user_id ? (string) $this->user_id : null,
            'session_id' => (string) $this->session_id,
            'product_id' => $this->product_id ? (string) $this->product_id : null,
            'category_id' => $this->category_id ? (string) $this->category_id : null,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
