<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Class ProductDetailResource
 *
 * @package App\Modules\Catalog\Resources
 */
class ProductDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $isAdmin = $request->user()?->hasRole(['super_admin', 'admin', 'manager']) ?? false;

        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'sku' => $this->sku,
            'description' => $this->description,
            'short_description' => $this->short_description,
            'base_price' => (string) $this->base_price,
            'compare_at_price' => $this->compare_at_price !== null ? (string) $this->compare_at_price : null,
            'cost_price' => $isAdmin && $this->cost_price !== null ? (string) $this->cost_price : null,
            'currency_code' => $this->currency_code,
            'tax_class' => $this->tax_class,
            'weight' => $this->weight !== null ? (string) $this->weight : null,
            'weight_unit' => $this->weight_unit instanceof \BackedEnum ? $this->weight_unit->value : (string) $this->weight_unit,
            'length' => $this->length !== null ? (string) $this->length : null,
            'width' => $this->width !== null ? (string) $this->width : null,
            'height' => $this->height !== null ? (string) $this->height : null,
            'is_digital' => $this->is_digital,
            'is_featured' => $this->is_featured,
            'is_active' => $this->is_active,
            'status' => $this->status instanceof \BackedEnum ? $this->status->value : (string) $this->status,
            'visibility' => $this->visibility instanceof \BackedEnum ? $this->visibility->value : (string) $this->visibility,
            'avg_rating' => (string) $this->avg_rating,
            'review_count' => $this->review_count,
            'total_sold' => $this->total_sold,
            'meta_title' => $this->meta_title,
            'meta_description' => $this->meta_description,
            'category' => $this->whenLoaded('category', function () {
                return $this->category ? [
                    'id' => $this->category->id,
                    'name' => $this->category->name,
                    'slug' => $this->category->slug,
                ] : null;
            }),
            'categories' => CategoryResource::collection($this->whenLoaded('categories')),
            'brand' => $this->whenLoaded('brand', function () {
                return $this->brand ? [
                    'id' => $this->brand->id,
                    'name' => $this->brand->name,
                    'slug' => $this->brand->slug,
                    'logo_url' => $this->brand->logo_url,
                ] : null;
            }),
            'images' => ProductImageResource::collection($this->whenLoaded('images')),
            'variants' => ProductVariantResource::collection($this->whenLoaded('variants')),
            'tags' => $this->whenLoaded('tags', function () {
                return $this->tags->map(fn ($tag) => ['id' => $tag->id, 'name' => $tag->name, 'slug' => $tag->slug]);
            }),
            'published_at' => $this->published_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
