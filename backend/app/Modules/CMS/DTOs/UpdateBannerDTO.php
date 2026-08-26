<?php

declare(strict_types=1);

namespace App\Modules\CMS\DTOs;

use App\Core\Abstracts\AbstractDTO;
use Carbon\Carbon;
use Illuminate\Http\Request;

/**
 * Class UpdateBannerDTO
 *
 * @package App\Modules\CMS\DTOs
 */
class UpdateBannerDTO extends AbstractDTO
{
    public function __construct(
        public readonly ?string $title = null,
        public readonly ?string $imageUrl = null,
        public readonly ?string $subtitle = null,
        public readonly ?string $linkUrl = null,
        public readonly ?string $buttonText = null,
        public readonly ?string $position = null,
        public readonly ?int $sortOrder = null,
        public readonly ?bool $isActive = null,
        public readonly ?Carbon $startsAt = null,
        public readonly ?Carbon $expiresAt = null,
    ) {
    }

    public static function fromRequest(Request $request): static
    {
        return new static(
            title: $request->has('title') ? (string) $request->input('title') : null,
            imageUrl: $request->has('image_url') ? (string) $request->input('image_url') : null,
            subtitle: $request->has('subtitle') ? (string) $request->input('subtitle') : null,
            linkUrl: $request->has('link_url') ? (string) $request->input('link_url') : null,
            buttonText: $request->has('button_text') ? (string) $request->input('button_text') : null,
            position: $request->has('position') ? (string) $request->input('position') : null,
            sortOrder: $request->has('sort_order') ? (int) $request->input('sort_order') : null,
            isActive: $request->has('is_active') ? (bool) $request->input('is_active') : null,
            startsAt: $request->has('starts_at') && $request->input('starts_at') !== null ? Carbon::parse($request->input('starts_at')) : null,
            expiresAt: $request->has('expires_at') && $request->input('expires_at') !== null ? Carbon::parse($request->input('expires_at')) : null,
        );
    }
}
