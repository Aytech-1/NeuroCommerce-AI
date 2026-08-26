<?php

declare(strict_types=1);

namespace App\Modules\AI\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Class AIModelVersionResource
 *
 * @package App\Modules\AI\Resources
 */
class AIModelVersionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'version' => (string) $this->version,
            'model_type' => (string) $this->model_type,
            'file_path' => (string) $this->file_path,
            'training_data_range' => $this->training_data_range,
            'training_records' => (int) $this->training_records,
            'metrics' => $this->metrics,
            'is_active' => (bool) $this->is_active,
            'trained_at' => $this->trained_at?->toIso8601String(),
        ];
    }
}
