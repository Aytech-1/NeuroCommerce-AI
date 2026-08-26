<?php

declare(strict_types=1);

namespace App\Modules\Catalog\DTOs;

use App\Core\Abstracts\AbstractDTO;

/**
 * Class UpdateProductDTO
 *
 * @package App\Modules\Catalog\DTOs
 */
class UpdateProductDTO extends AbstractDTO
{
    public function __construct(
        public ?string $name = null,
        public ?string $sku = null,
        public ?string $slug = null,
        public ?string $description = null,
        public ?string $short_description = null,
        public ?string $category_id = null,
        public ?string $brand_id = null,
        public float|string|null $base_price = null,
        public float|string|null $compare_at_price = null,
        public float|string|null $cost_price = null,
        public ?string $currency_code = null,
        public ?string $tax_class = null,
        public float|string|null $weight = null,
        public ?string $weight_unit = null,
        public float|string|null $length = null,
        public float|string|null $width = null,
        public float|string|null $height = null,
        public ?bool $is_digital = null,
        public ?bool $is_featured = null,
        public ?bool $is_active = null,
        public ?string $status = null,
        public ?string $visibility = null,
        public ?string $meta_title = null,
        public ?string $meta_description = null,
        public ?string $published_at = null,
        public ?array $tags = null,
        public ?array $category_ids = null,
    ) {
    }
}
