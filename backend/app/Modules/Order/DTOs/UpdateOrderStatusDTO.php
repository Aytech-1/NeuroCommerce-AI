<?php

declare(strict_types=1);

namespace App\Modules\Order\DTOs;

use App\Core\Abstracts\AbstractDTO;
use Illuminate\Http\Request;

/**
 * Class UpdateOrderStatusDTO
 *
 * @package App\Modules\Order\DTOs
 */
class UpdateOrderStatusDTO extends AbstractDTO
{
    public function __construct(
        public readonly string $status,
        public readonly ?string $comment = null
    ) {
    }

    public static function fromRequest(Request $request): static
    {
        return new static(
            status: (string) $request->input('status'),
            comment: $request->input('comment')
        );
    }
}
