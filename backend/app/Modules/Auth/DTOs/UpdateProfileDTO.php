<?php

declare(strict_types=1);

namespace App\Modules\Auth\DTOs;

use App\Core\Abstracts\AbstractDTO;

/**
 * Class UpdateProfileDTO
 *
 * @package App\Modules\Auth\DTOs
 */
class UpdateProfileDTO extends AbstractDTO
{
    public function __construct(
        public readonly ?string $first_name = null,
        public readonly ?string $last_name = null,
        public readonly ?string $phone = null,
        public readonly ?string $avatar = null,
        public readonly ?string $locale = null,
        public readonly ?string $timezone = null,
        public readonly ?string $date_of_birth = null,
        public readonly ?string $gender = null,
        public readonly ?string $company = null,
        public readonly ?string $tax_id = null,
    ) {
    }
}
