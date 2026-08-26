<?php

declare(strict_types=1);

namespace App\Modules\Order\DTOs;

use App\Core\Abstracts\AbstractDTO;
use Illuminate\Http\Request;

/**
 * Class CancelOrderDTO
 *
 * @package App\Modules\Order\DTOs
 */
class CancelOrderDTO extends AbstractDTO
{
    public function __construct(
        public readonly ?string $reason = null
    ) {
    }

    public static function fromRequest(Request $request): static
    {
        return new static(
            reason: $request->input('reason')
        );
    }
}
