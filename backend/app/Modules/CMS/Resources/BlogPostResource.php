<?php

declare(strict_types=1);

namespace App\Modules\CMS\Resources;

use App\Modules\CMS\Models\BlogPost;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Class BlogPostResource
 *
 * @mixin BlogPost
 * @package App\Modules\CMS\Resources
 */
class BlogPostResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'content' => $this->content,
            'excerpt' => $this->excerpt,
            'category' => $this->category,
            'tags' => $this->tags ?? [],
            'author' => $this->whenLoaded('author', function () {
                return [
                    'id' => $this->author->id,
                    'name' => "{$this->author->first_name} {$this->author->last_name}",
                ];
            }),
            'featured_image' => $this->featured_image,
            'is_featured' => $this->is_featured,
            'view_count' => $this->view_count,
            'seo' => [
                'meta_title' => $this->meta_title ?? $this->title,
                'meta_description' => $this->meta_description ?? $this->excerpt,
                'canonical_url' => url("/blog/{$this->slug}"),
                'og_image' => $this->featured_image,
            ],
            'published_at' => $this->published_at?->toISOString(),
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
        ];
    }
}
