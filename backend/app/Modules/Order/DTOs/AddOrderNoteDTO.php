<?php

declare(strict_types=1);

namespace App\Modules\Order\DTOs;

use App\Core\Abstracts\AbstractDTO;
use Illuminate\Http\Request;

/**
 * Class AddOrderNoteDTO
 *
 * @package App\Modules\Order\DTOs
 */
class AddOrderNoteDTO extends AbstractDTO
{
    public function __construct(
        public readonly string $notes
    ) {
    }

    public static function fromRequest(Request $request): static
    {
        return new static(
            notes: (string) $request->input('notes')
        );
    }
}
