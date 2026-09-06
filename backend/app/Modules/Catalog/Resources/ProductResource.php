<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Class ProductResource
 *
 * @package App\Modules\Catalog\Resources
 */
class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $isAdmin = $request->user()?->hasRole(['super_admin', 'admin', 'manager']) ?? false;

        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'sku' => $this->sku,
            'short_description' => $this->short_description,
            'base_price' => (string) $this->base_price,
            'compare_at_price' => $this->compare_at_price !== null ? (string) $this->compare_at_price : null,
            'cost_price' => $isAdmin && $this->cost_price !== null ? (string) $this->cost_price : null,
            'currency_code' => $this->currency_code,
            'status' => $this->status instanceof \BackedEnum ? $this->status->value : (string) $this->status,
            'visibility' => $this->visibility instanceof \BackedEnum ? $this->visibility->value : (string) $this->visibility,
            'is_featured' => $this->is_featured,
            'is_active' => $this->is_active,
            'avg_rating' => (string) $this->avg_rating,
            'review_count' => $this->review_count,
            'total_sold' => $this->total_sold,
            'category' => $this->whenLoaded('category', function () {
                return $this->category ? [
                    'id' => $this->category->id,
                    'name' => $this->category->name,
                    'slug' => $this->category->slug,
                ] : null;
            }),
            'brand' => $this->whenLoaded('brand', function () {
                return $this->brand ? [
                    'id' => $this->brand->id,
                    'name' => $this->brand->name,
                    'slug' => $this->brand->slug,
                    'logo_url' => $this->brand->logo_url,
                ] : null;
            }),
            'primary_image' => $this->whenLoaded('primaryImage', function () {
                $primary = $this->primaryImage ?? ($this->relationLoaded('images') ? $this->images?->sortBy('sort_order')->first() : null);
                return $primary ? [
                    'id' => $primary->id,
                    'url' => $primary->url,
                    'alt_text' => $primary->alt_text,
                ] : null;
            }, function () {
                if ($this->relationLoaded('images') && $this->images?->isNotEmpty()) {
                    $primary = $this->images->firstWhere('is_primary', true) ?? $this->images->sortBy('sort_order')->first();
                    return $primary ? [
                        'id' => $primary->id,
                        'url' => $primary->url,
                        'alt_text' => $primary->alt_text,
                    ] : null;
                }
                return null;
            }),
            'images' => ProductImageResource::collection($this->whenLoaded('images')),
            'published_at' => $this->published_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
