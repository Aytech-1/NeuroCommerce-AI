<?php

declare(strict_types=1);

namespace App\Modules\CMS\DTOs;

use App\Core\Abstracts\AbstractDTO;
use Illuminate\Http\Request;

/**
 * Class ContactMessageDTO
 *
 * @package App\Modules\CMS\DTOs
 */
class ContactMessageDTO extends AbstractDTO
{
    public function __construct(
        public readonly string $name,
        public readonly string $email,
        public readonly string $subject,
        public readonly string $message,
        public readonly ?string $phone = null,
        public readonly ?string $ipAddress = null,
    ) {
    }

    public static function fromRequest(Request $request): static
    {
        return new static(
            name: (string) $request->input('name'),
            email: (string) $request->input('email'),
            subject: (string) $request->input('subject'),
            message: (string) $request->input('message'),
            phone: $request->has('phone') ? (string) $request->input('phone') : null,
            ipAddress: $request->ip(),
        );
    }
}
