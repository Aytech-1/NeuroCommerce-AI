<?php

declare(strict_types=1);

namespace App\Modules\CMS\DTOs;

use App\Core\Abstracts\AbstractDTO;
use App\Shared\Enums\PageStatus;
use Carbon\Carbon;
use Illuminate\Http\Request;

/**
 * Class UpdateBlogPostDTO
 *
 * @package App\Modules\CMS\DTOs
 */
class UpdateBlogPostDTO extends AbstractDTO
{
    public function __construct(
        public readonly ?string $title = null,
        public readonly ?string $slug = null,
        public readonly ?string $content = null,
        public readonly ?string $excerpt = null,
        public readonly ?string $category = null,
        public readonly ?array $tags = null,
        public readonly ?string $featuredImage = null,
        public readonly ?PageStatus $status = null,
        public readonly ?bool $isFeatured = null,
        public readonly ?string $metaTitle = null,
        public readonly ?string $metaDescription = null,
        public readonly ?Carbon $publishedAt = null,
    ) {
    }

    public static function fromRequest(Request $request): static
    {
        return new static(
            title: $request->has('title') ? (string) $request->input('title') : null,
            slug: $request->has('slug') ? (string) $request->input('slug') : null,
            content: $request->has('content') ? (string) $request->input('content') : null,
            excerpt: $request->has('excerpt') ? (string) $request->input('excerpt') : null,
            category: $request->has('category') ? (string) $request->input('category') : null,
            tags: $request->has('tags') ? (array) $request->input('tags') : null,
            featuredImage: $request->has('featured_image') ? (string) $request->input('featured_image') : null,
            status: $request->has('status') && $request->input('status') !== null ? PageStatus::from((string) $request->input('status')) : null,
            isFeatured: $request->has('is_featured') ? (bool) $request->input('is_featured') : null,
            metaTitle: $request->has('meta_title') ? (string) $request->input('meta_title') : null,
            metaDescription: $request->has('meta_description') ? (string) $request->input('meta_description') : null,
            publishedAt: $request->has('published_at') && $request->input('published_at') !== null ? Carbon::parse($request->input('published_at')) : null,
        );
    }
}
