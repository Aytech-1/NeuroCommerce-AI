<?php

declare(strict_types=1);

namespace App\Modules\Auth\DTOs;

use App\Core\Abstracts\AbstractDTO;

/**
 * Class LoginUserDTO
 *
 * @package App\Modules\Auth\DTOs
 */
class LoginUserDTO extends AbstractDTO
{
    public function __construct(
        public readonly string $email,
        public readonly string $password,
        public readonly bool $remember_me = false,
        public readonly string $device_name = 'Web Browser',
    ) {
    }
}
