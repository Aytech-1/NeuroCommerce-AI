<?php

declare(strict_types=1);

namespace App\Modules\Auth\DTOs;

use App\Core\Abstracts\AbstractDTO;

/**
 * Class ForgotPasswordDTO
 *
 * @package App\Modules\Auth\DTOs
 */
class ForgotPasswordDTO extends AbstractDTO
{
    public function __construct(
        public readonly string $email,
    ) {
    }
}
