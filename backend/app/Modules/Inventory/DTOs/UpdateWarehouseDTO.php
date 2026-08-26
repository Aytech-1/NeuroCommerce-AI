<?php

declare(strict_types=1);

namespace App\Modules\Inventory\DTOs;

use App\Core\Abstracts\AbstractDTO;

/**
 * Class UpdateWarehouseDTO
 *
 * @package App\Modules\Inventory\DTOs
 */
class UpdateWarehouseDTO extends AbstractDTO
{
    public function __construct(
        public ?string $name = null,
        public ?string $code = null,
        public ?string $address_id = null,
        public ?bool $is_active = null,
        public ?bool $is_default = null,
        public ?int $priority = null
    ) {
    }
}
