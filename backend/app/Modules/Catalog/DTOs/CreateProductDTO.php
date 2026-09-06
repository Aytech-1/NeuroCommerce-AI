<?php

declare(strict_types=1);

namespace App\Modules\Catalog\DTOs;

use App\Core\Abstracts\AbstractDTO;

/**
 * Class CreateProductDTO
 *
 * @package App\Modules\Catalog\DTOs
 */
class CreateProductDTO extends AbstractDTO
{
    public function __construct(
        public string $name,
        public string $sku,
        public ?string $slug = null,
        public ?string $description = null,
        public ?string $short_description = null,
        public ?string $category_id = null,
        public ?string $brand_id = null,
        public float|string $base_price = 0.0,
        public float|string|null $compare_at_price = null,
        public float|string|null $cost_price = null,
        public string $currency_code = 'NGN',
        public string $tax_class = 'standard',
        public float|string|null $weight = null,
        public string $weight_unit = 'kg',
        public float|string|null $length = null,
        public float|string|null $width = null,
        public float|string|null $height = null,
        public bool $is_digital = false,
        public bool $is_featured = false,
        public bool $is_active = true,
        public string $status = 'draft',
        public string $visibility = 'visible',
        public ?string $meta_title = null,
        public ?string $meta_description = null,
        public ?string $published_at = null,
        public ?array $tags = null,
        public ?array $category_ids = null,
    ) {
    }
}
