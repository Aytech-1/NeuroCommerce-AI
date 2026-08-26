<?php

declare(strict_types=1);

namespace App\Modules\Review\Resources;

use App\Modules\Review\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Class ReviewResource
 *
 * @mixin Review
 * @package App\Modules\Review\Resources
 */
class ReviewResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'product' => $this->whenLoaded('product', function () {
                return [
                    'id' => $this->product->id,
                    'name' => $this->product->name,
                    'slug' => $this->product->slug,
                    'base_price' => $this->product->base_price,
                ];
            }),
            'user' => $this->whenLoaded('user', function () {
                return [
                    'id' => $this->user->id,
                    'first_name' => $this->user->first_name,
                    'last_name' => $this->user->last_name ? substr($this->user->last_name, 0, 1) . '.' : '',
                    'avatar' => $this->user->avatar,
                ];
            }),
            'rating' => $this->rating,
            'title' => $this->title,
            'body' => $this->body,
            'images' => $this->images,
            'is_verified_purchase' => (bool) $this->is_verified_purchase,
            'is_featured' => (bool) $this->is_featured,
            'is_approved' => (bool) $this->is_approved,
            'helpful_count' => (int) $this->helpful_count,
            'admin_reply' => $this->admin_reply,
            'admin_reply_at' => $this->admin_reply_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
