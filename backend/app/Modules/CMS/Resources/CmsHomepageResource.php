<?php

declare(strict_types=1);

namespace App\Modules\CMS\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Class CmsHomepageResource
 *
 * @package App\Modules\CMS\Resources
 */
class CmsHomepageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'hero_banners' => BannerResource::collection($this['hero_banners'] ?? []),
            'promo_banners' => BannerResource::collection($this['promo_banners'] ?? []),
            'featured_posts' => BlogPostResource::collection($this['featured_posts'] ?? []),
            'testimonials' => TestimonialResource::collection($this['testimonials'] ?? []),
            'faqs' => FaqResource::collection($this['faqs'] ?? []),
        ];
    }
}
