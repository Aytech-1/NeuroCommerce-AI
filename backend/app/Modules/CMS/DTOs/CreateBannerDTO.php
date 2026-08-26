<?php

declare(strict_types=1);

namespace App\Modules\CMS\DTOs;

use App\Core\Abstracts\AbstractDTO;
use Carbon\Carbon;
use Illuminate\Http\Request;

/**
 * Class CreateBannerDTO
 *
 * @package App\Modules\CMS\DTOs
 */
class CreateBannerDTO extends AbstractDTO
{
    public function __construct(
        public readonly string $title,
        public readonly string $imageUrl,
        public readonly ?string $subtitle = null,
        public readonly ?string $linkUrl = null,
        public readonly ?string $buttonText = null,
        public readonly string $position = 'hero',
        public readonly int $sortOrder = 0,
        public readonly bool $isActive = true,
        public readonly ?Carbon $startsAt = null,
        public readonly ?Carbon $expiresAt = null,
    ) {
    }

    public static function fromRequest(Request $request): static
    {
        return new static(
            title: (string) $request->input('title'),
            imageUrl: (string) $request->input('image_url'),
            subtitle: $request->has('subtitle') ? (string) $request->input('subtitle') : null,
            linkUrl: $request->has('link_url') ? (string) $request->input('link_url') : null,
            buttonText: $request->has('button_text') ? (string) $request->input('button_text') : null,
            position: (string) $request->input('position', 'hero'),
            sortOrder: (int) $request->input('sort_order', 0),
            isActive: (bool) $request->input('is_active', true),
            startsAt: $request->has('starts_at') && $request->input('starts_at') !== null ? Carbon::parse($request->input('starts_at')) : null,
            expiresAt: $request->has('expires_at') && $request->input('expires_at') !== null ? Carbon::parse($request->input('expires_at')) : null,
        );
    }
}
