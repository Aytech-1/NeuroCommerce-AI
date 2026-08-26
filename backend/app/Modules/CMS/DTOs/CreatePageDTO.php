<?php

declare(strict_types=1);

namespace App\Modules\CMS\DTOs;

use App\Core\Abstracts\AbstractDTO;
use App\Shared\Enums\PageStatus;
use Carbon\Carbon;
use Illuminate\Http\Request;

/**
 * Class CreatePageDTO
 *
 * @package App\Modules\CMS\DTOs
 */
class CreatePageDTO extends AbstractDTO
{
    public function __construct(
        public readonly string $title,
        public readonly ?string $slug = null,
        public readonly ?string $content = null,
        public readonly ?string $excerpt = null,
        public readonly string $template = 'default',
        public readonly PageStatus $status = PageStatus::DRAFT,
        public readonly ?string $authorId = null,
        public readonly ?string $featuredImage = null,
        public readonly ?string $metaTitle = null,
        public readonly ?string $metaDescription = null,
        public readonly ?Carbon $publishedAt = null,
    ) {
    }

    public static function fromRequest(Request $request): static
    {
        return new static(
            title: (string) $request->input('title'),
            slug: $request->has('slug') && $request->input('slug') !== null ? (string) $request->input('slug') : null,
            content: $request->has('content') && $request->input('content') !== null ? (string) $request->input('content') : null,
            excerpt: $request->has('excerpt') && $request->input('excerpt') !== null ? (string) $request->input('excerpt') : null,
            template: (string) $request->input('template', 'default'),
            status: $request->has('status') ? PageStatus::from((string) $request->input('status')) : PageStatus::DRAFT,
            authorId: $request->user()?->id,
            featuredImage: $request->has('featured_image') ? (string) $request->input('featured_image') : null,
            metaTitle: $request->has('meta_title') ? (string) $request->input('meta_title') : null,
            metaDescription: $request->has('meta_description') ? (string) $request->input('meta_description') : null,
            publishedAt: $request->has('published_at') && $request->input('published_at') !== null ? Carbon::parse($request->input('published_at')) : null,
        );
    }
}
