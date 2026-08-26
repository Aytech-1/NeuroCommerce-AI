<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Class SearchSuggestionResource
 *
 * @package App\Modules\Catalog\Resources
 */
class SearchSuggestionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'name' => (string) $this->name,
            'slug' => (string) $this->slug,
            'sku' => (string) $this->sku,
            'base_price' => (float) $this->base_price,
            'category' => $this->whenLoaded('category', function () {
                return [
                    'id' => (string) $this->category->id,
                    'name' => (string) $this->category->name,
                    'slug' => (string) $this->category->slug,
                ];
            }),
        ];
    }
}
