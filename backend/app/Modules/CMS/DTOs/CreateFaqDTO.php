<?php

declare(strict_types=1);

namespace App\Modules\CMS\DTOs;

use App\Core\Abstracts\AbstractDTO;
use Illuminate\Http\Request;

/**
 * Class CreateFaqDTO
 *
 * @package App\Modules\CMS\DTOs
 */
class CreateFaqDTO extends AbstractDTO
{
    public function __construct(
        public readonly string $question,
        public readonly string $answer,
        public readonly ?string $category = null,
        public readonly int $sortOrder = 0,
        public readonly bool $isActive = true,
    ) {
    }

    public static function fromRequest(Request $request): static
    {
        return new static(
            question: (string) $request->input('question'),
            answer: (string) $request->input('answer'),
            category: $request->has('category') ? (string) $request->input('category') : null,
            sortOrder: (int) $request->input('sort_order', 0),
            isActive: (bool) $request->input('is_active', true),
        );
    }
}
