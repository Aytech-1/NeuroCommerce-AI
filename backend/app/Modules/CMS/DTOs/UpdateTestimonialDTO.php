<?php

declare(strict_types=1);

namespace App\Modules\CMS\DTOs;

use App\Core\Abstracts\AbstractDTO;
use Illuminate\Http\Request;

/**
 * Class UpdateTestimonialDTO
 *
 * @package App\Modules\CMS\DTOs
 */
class UpdateTestimonialDTO extends AbstractDTO
{
    public function __construct(
        public readonly ?string $customerName = null,
        public readonly ?string $company = null,
        public readonly ?string $content = null,
        public readonly ?int $rating = null,
        public readonly ?string $avatarUrl = null,
        public readonly ?bool $isActive = null,
        public readonly ?int $sortOrder = null,
    ) {
    }

    public static function fromRequest(Request $request): static
    {
        return new static(
            customerName: $request->has('customer_name') ? (string) $request->input('customer_name') : null,
            company: $request->has('company') ? (string) $request->input('company') : null,
            content: $request->has('content') ? (string) $request->input('content') : null,
            rating: $request->has('rating') ? (int) $request->input('rating') : null,
            avatarUrl: $request->has('avatar_url') ? (string) $request->input('avatar_url') : null,
            isActive: $request->has('is_active') ? (bool) $request->input('is_active') : null,
            sortOrder: $request->has('sort_order') ? (int) $request->input('sort_order') : null,
        );
    }
}
