<?php

declare(strict_types=1);

namespace App\Modules\Inventory\DTOs;

use App\Core\Abstracts\AbstractDTO;

/**
 * Class StoreWarehouseDTO
 *
 * @package App\Modules\Inventory\DTOs
 */
class StoreWarehouseDTO extends AbstractDTO
{
    public function __construct(
        public string $name,
        public string $code,
        public ?string $address_id = null,
        public bool $is_active = true,
        public bool $is_default = false,
        public int $priority = 0
    ) {
    }
}
