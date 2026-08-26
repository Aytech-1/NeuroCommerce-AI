<?php

declare(strict_types=1);

namespace App\Modules\CMS\Resources;

use App\Modules\CMS\Models\BlogPost;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Class AdminBlogPostResource
 *
 * @mixin BlogPost
 * @package App\Modules\CMS\Resources
 */
class AdminBlogPostResource extends JsonResource
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
                    'email' => $this->author->email,
                ];
            }),
            'featured_image' => $this->featured_image,
            'status' => $this->status->value,
            'is_featured' => $this->is_featured,
            'view_count' => $this->view_count,
            'meta_title' => $this->meta_title,
            'meta_description' => $this->meta_description,
            'published_at' => $this->published_at?->toISOString(),
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
            'deleted_at' => $this->deleted_at?->toISOString(),
        ];
    }
}
