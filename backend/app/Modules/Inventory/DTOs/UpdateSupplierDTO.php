<?php

declare(strict_types=1);

namespace App\Modules\Inventory\DTOs;

use App\Core\Abstracts\AbstractDTO;

/**
 * Class UpdateSupplierDTO
 *
 * @package App\Modules\Inventory\DTOs
 */
class UpdateSupplierDTO extends AbstractDTO
{
    public function __construct(
        public ?string $name = null,
        public ?string $code = null,
        public ?string $contact_name = null,
        public ?string $email = null,
        public ?string $phone = null,
        public ?string $website = null,
        public ?string $address_id = null,
        public ?bool $is_active = null
    ) {
    }
}
