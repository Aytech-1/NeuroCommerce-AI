<?php

declare(strict_types=1);

namespace App\Modules\Auth\DTOs;

use App\Core\Abstracts\AbstractDTO;

/**
 * Class VerifyEmailDTO
 *
 * @package App\Modules\Auth\DTOs
 */
class VerifyEmailDTO extends AbstractDTO
{
    public function __construct(
        public readonly string $token,
        public readonly ?string $email = null,
    ) {
    }
}
