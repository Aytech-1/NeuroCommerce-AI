<?php

declare(strict_types=1);

namespace App\Modules\Auth\DTOs;

use App\Core\Abstracts\AbstractDTO;

/**
 * Class AddressDTO
 *
 * @package App\Modules\Auth\DTOs
 */
class AddressDTO extends AbstractDTO
{
    public function __construct(
        public readonly string $first_name,
        public readonly string $last_name,
        public readonly string $address_line_1,
        public readonly string $city,
        public readonly string $postal_code,
        public readonly string $country_code,
        public readonly string $address_type = 'shipping',
        public readonly ?string $label = null,
        public readonly ?string $company = null,
        public readonly ?string $address_line_2 = null,
        public readonly ?string $state_province = null,
        public readonly ?string $phone = null,
        public readonly bool $is_default = false,
        public readonly ?float $latitude = null,
        public readonly ?float $longitude = null,
    ) {
    }
}
