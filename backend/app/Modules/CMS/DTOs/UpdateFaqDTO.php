<?php

declare(strict_types=1);

namespace App\Modules\CMS\DTOs;

use App\Core\Abstracts\AbstractDTO;
use Illuminate\Http\Request;

/**
 * Class UpdateFaqDTO
 *
 * @package App\Modules\CMS\DTOs
 */
class UpdateFaqDTO extends AbstractDTO
{
    public function __construct(
        public readonly ?string $question = null,
        public readonly ?string $answer = null,
        public readonly ?string $category = null,
        public readonly ?int $sortOrder = null,
        public readonly ?bool $isActive = null,
    ) {
    }

    public static function fromRequest(Request $request): static
    {
        return new static(
            question: $request->has('question') ? (string) $request->input('question') : null,
            answer: $request->has('answer') ? (string) $request->input('answer') : null,
            category: $request->has('category') ? (string) $request->input('category') : null,
            sortOrder: $request->has('sort_order') ? (int) $request->input('sort_order') : null,
            isActive: $request->has('is_active') ? (bool) $request->input('is_active') : null,
        );
    }
}
