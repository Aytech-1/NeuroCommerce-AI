<?php

declare(strict_types=1);

namespace App\Modules\AI\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Class AIRecommendationResource
 *
 * @package App\Modules\AI\Resources
 */
class AIRecommendationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'strategy' => (string) $this->strategy,
            'product_id' => (string) $this->product_id,
            'score' => (float) $this->score,
            'rank' => (int) $this->rank,
            'product' => $this->whenLoaded('product', function () {
                return [
                    'id' => (string) $this->product->id,
                    'name' => (string) $this->product->name,
                    'slug' => (string) $this->product->slug,
                    'base_price' => (float) $this->product->base_price,
                ];
            }),
            'generated_at' => $this->generated_at?->toIso8601String(),
        ];
    }
}
