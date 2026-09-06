<?php

declare(strict_types=1);

namespace App\Modules\Cart\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * CartItemResource
 *
 * Formats a shopping cart line item with product, variant, and calculated line total.
 */
class CartItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'cart_id' => $this->cart_id,
            'product_id' => $this->product_id,
            'product' => [
                'id' => $this->product?->id,
                'name' => $this->product?->name,
                'slug' => $this->product?->slug,
                'sku' => $this->product?->sku,
                'primary_image_url' => $this->product?->primaryImage?->url ?? $this->product?->primary_image_url,
                'primary_image' => $this->product?->primaryImage ? [
                    'id' => $this->product->primaryImage->id,
                    'url' => $this->product->primaryImage->url,
                ] : null,
                'is_active' => (bool) $this->product?->is_active,
            ],
            'variant_id' => $this->variant_id,
            'variant' => $this->variant ? [
                'id' => $this->variant->id,
                'name' => $this->variant->name,
                'sku' => $this->variant->sku,
                'price' => (float) $this->variant->price,
            ] : null,
            'quantity' => (int) $this->quantity,
            'unit_price' => (float) $this->unit_price,
            'line_total' => $this->calculateLineTotal()->getFormattedAmount(),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
