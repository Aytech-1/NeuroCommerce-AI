<?php

declare(strict_types=1);

namespace App\Modules\Catalog\DTOs;

use App\Core\Abstracts\AbstractDTO;

/**
 * Class CreateVariantDTO
 *
 * @package App\Modules\Catalog\DTOs
 */
class CreateVariantDTO extends AbstractDTO
{
    public function __construct(
        public string $sku,
        public ?string $name = null,
        public float|string|null $price = null,
        public float|string|null $compare_at_price = null,
        public float|string|null $cost_price = null,
        public float|string|null $weight = null,
        public ?string $barcode = null,
        public ?string $image_url = null,
        public bool $is_active = true,
        public int $sort_order = 0,
        public ?array $attribute_value_ids = null,
    ) {
    }
}
