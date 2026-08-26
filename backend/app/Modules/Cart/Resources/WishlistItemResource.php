<?php

declare(strict_types=1);

namespace App\Modules\Cart\Resources;

use App\Modules\Catalog\Enums\ProductStatus;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * WishlistItemResource
 */
class WishlistItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'wishlist_id' => $this->wishlist_id,
            'product_id' => $this->product_id,
            'product' => [
                'id' => $this->product?->id,
                'name' => $this->product?->name,
                'slug' => $this->product?->slug,
                'sku' => $this->product?->sku,
                'base_price' => (float) $this->product?->base_price,
                'primary_image_url' => $this->product?->primaryImage?->url,
                'is_active' => (bool) $this->product?->is_active,
                'in_stock' => (bool) ($this->product?->is_active && $this->product?->status === ProductStatus::ACTIVE),
            ],
            'variant_id' => $this->variant_id,
            'variant' => $this->variant ? [
                'id' => $this->variant->id,
                'name' => $this->variant->name,
                'sku' => $this->variant->sku,
                'price' => (float) $this->variant->price,
            ] : null,
            'notes' => $this->notes,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
