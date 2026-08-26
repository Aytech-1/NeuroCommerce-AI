<?php

declare(strict_types=1);

namespace App\Modules\Inventory\DTOs;

use App\Core\Abstracts\AbstractDTO;
use App\Modules\Inventory\Enums\StockMovementType;

/**
 * Class AdjustStockDTO
 *
 * @package App\Modules\Inventory\DTOs
 */
class AdjustStockDTO extends AbstractDTO
{
    public function __construct(
        public string $product_id,
        public ?string $variant_id,
        public string $warehouse_id,
        public int $quantity_delta,
        public StockMovementType $movement_type,
        public ?string $notes = null,
        public ?string $reference_type = null,
        public ?string $reference_id = null
    ) {
    }
}
