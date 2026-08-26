<?php

declare(strict_types=1);

namespace App\Modules\Inventory\DTOs;

use App\Core\Abstracts\AbstractDTO;

/**
 * Class TransferStockDTO
 *
 * @package App\Modules\Inventory\DTOs
 */
class TransferStockDTO extends AbstractDTO
{
    public function __construct(
        public string $product_id,
        public ?string $variant_id,
        public string $source_warehouse_id,
        public string $destination_warehouse_id,
        public int $quantity,
        public ?string $notes = null
    ) {
    }
}
