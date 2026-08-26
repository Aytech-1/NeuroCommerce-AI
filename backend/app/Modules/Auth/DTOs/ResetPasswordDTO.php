<?php

declare(strict_types=1);

namespace App\Modules\Auth\DTOs;

use App\Core\Abstracts\AbstractDTO;

/**
 * Class ResetPasswordDTO
 *
 * @package App\Modules\Auth\DTOs
 */
class ResetPasswordDTO extends AbstractDTO
{
    public function __construct(
        public readonly string $token,
        public readonly string $email,
        public readonly string $password,
        public readonly string $password_confirmation,
    ) {
    }
}
