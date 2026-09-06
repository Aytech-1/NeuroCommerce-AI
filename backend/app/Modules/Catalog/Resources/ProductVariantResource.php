<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Class ProductVariantResource
 *
 * @package App\Modules\Catalog\Resources
 */
class ProductVariantResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $isAdmin = $request->user()?->hasRole(['super_admin', 'admin', 'manager']) ?? false;

        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'sku' => $this->sku,
            'name' => $this->name,
            'price' => $this->price !== null ? (string) $this->price : null,
            'compare_at_price' => $this->compare_at_price !== null ? (string) $this->compare_at_price : null,
            'cost_price' => $isAdmin && $this->cost_price !== null ? (string) $this->cost_price : null,
            'weight' => $this->weight !== null ? (string) $this->weight : null,
            'barcode' => $this->barcode,
            'image_url' => $this->image_url,
            'is_active' => $this->is_active,
            'sort_order' => $this->sort_order,
            'attributes' => $this->whenLoaded('attributeValues', function () {
                return $this->attributeValues->map(function ($val) {
                    return [
                        'attribute_id' => $val->attribute_id,
                        'attribute_name' => $val->attribute?->name,
                        'attribute_slug' => $val->attribute?->slug,
                        'value_id' => $val->id,
                        'value' => $val->value,
                        'color_hex' => $val->color_hex,
                    ];
                });
            }),
            'attribute_values' => $this->whenLoaded('attributeValues', function () {
                return $this->attributeValues->map(function ($val) {
                    return [
                        'id' => $val->id,
                        'value' => $val->value,
                        'color_hex' => $val->color_hex,
                        'attribute' => $val->attribute ? [
                            'id' => $val->attribute->id,
                            'name' => $val->attribute->name,
                            'slug' => $val->attribute->slug,
                        ] : null,
                    ];
                });
            }),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
