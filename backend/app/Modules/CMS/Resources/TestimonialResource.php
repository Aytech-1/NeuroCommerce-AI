<?php

declare(strict_types=1);

namespace App\Modules\CMS\Resources;

use App\Modules\CMS\Models\Testimonial;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Class TestimonialResource
 *
 * @mixin Testimonial
 * @package App\Modules\CMS\Resources
 */
class TestimonialResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'customer_name' => $this->customer_name,
            'company' => $this->company,
            'content' => $this->content,
            'rating' => $this->rating,
            'avatar_url' => $this->avatar_url,
            'is_active' => $this->is_active,
            'sort_order' => $this->sort_order,
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
        ];
    }
}
