<?php

declare(strict_types=1);

namespace App\Modules\CMS\DTOs;

use App\Core\Abstracts\AbstractDTO;
use Illuminate\Http\Request;

/**
 * Class CreateTestimonialDTO
 *
 * @package App\Modules\CMS\DTOs
 */
class CreateTestimonialDTO extends AbstractDTO
{
    public function __construct(
        public readonly string $customerName,
        public readonly string $content,
        public readonly ?string $company = null,
        public readonly int $rating = 5,
        public readonly ?string $avatarUrl = null,
        public readonly bool $isActive = true,
        public readonly int $sortOrder = 0,
    ) {
    }

    public static function fromRequest(Request $request): static
    {
        return new static(
            customerName: (string) $request->input('customer_name'),
            content: (string) $request->input('content'),
            company: $request->has('company') ? (string) $request->input('company') : null,
            rating: (int) $request->input('rating', 5),
            avatarUrl: $request->has('avatar_url') ? (string) $request->input('avatar_url') : null,
            isActive: (bool) $request->input('is_active', true),
            sortOrder: (int) $request->input('sort_order', 0),
        );
    }
}
