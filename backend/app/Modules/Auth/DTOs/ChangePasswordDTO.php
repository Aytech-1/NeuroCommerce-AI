<?php

declare(strict_types=1);

namespace App\Modules\Auth\DTOs;

use App\Core\Abstracts\AbstractDTO;

/**
 * Class ChangePasswordDTO
 *
 * @package App\Modules\Auth\DTOs
 */
class ChangePasswordDTO extends AbstractDTO
{
    public function __construct(
        public readonly string $current_password,
        public readonly string $new_password,
        public readonly string $new_password_confirmation,
    ) {
    }
}
