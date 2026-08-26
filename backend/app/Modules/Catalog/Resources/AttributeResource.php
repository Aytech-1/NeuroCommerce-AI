<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Class AttributeResource
 *
 * @package App\Modules\Catalog\Resources
 */
class AttributeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'type' => $this->type instanceof \BackedEnum ? $this->type->value : (string) $this->type,
            'is_filterable' => $this->is_filterable,
            'is_variant' => $this->is_variant,
            'sort_order' => $this->sort_order,
            'values' => AttributeValueResource::collection($this->whenLoaded('values')),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
