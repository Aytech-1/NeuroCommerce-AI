<?php

declare(strict_types=1);

namespace App\Modules\Inventory\DTOs;

use App\Core\Abstracts\AbstractDTO;

/**
 * Class StoreSupplierDTO
 *
 * @package App\Modules\Inventory\DTOs
 */
class StoreSupplierDTO extends AbstractDTO
{
    public function __construct(
        public string $name,
        public string $code,
        public ?string $contact_name = null,
        public ?string $email = null,
        public ?string $phone = null,
        public ?string $website = null,
        public ?string $address_id = null,
        public bool $is_active = true
    ) {
    }
}
