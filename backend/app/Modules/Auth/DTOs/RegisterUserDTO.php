<?php

declare(strict_types=1);

namespace App\Modules\Auth\DTOs;

use App\Core\Abstracts\AbstractDTO;

/**
 * Class RegisterUserDTO
 *
 * @package App\Modules\Auth\DTOs
 */
class RegisterUserDTO extends AbstractDTO
{
    public function __construct(
        public readonly string $first_name,
        public readonly string $last_name,
        public readonly string $email,
        public readonly string $password,
        public readonly string $password_confirmation,
        public readonly ?string $phone = null,
        public readonly bool $agree_to_terms = true,
    ) {
    }
}
