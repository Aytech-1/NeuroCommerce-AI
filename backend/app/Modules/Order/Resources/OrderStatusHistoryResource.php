<?php

declare(strict_types=1);

namespace App\Modules\Order\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Class OrderStatusHistoryResource
 *
 * @package App\Modules\Order\Resources
 */
class OrderStatusHistoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'from_status' => $this->from_status,
            'to_status' => $this->to_status,
            'comment' => $this->comment,
            'changed_by' => $this->changer?->name ?: 'System',
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
