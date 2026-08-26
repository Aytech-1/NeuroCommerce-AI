<?php

declare(strict_types=1);

namespace App\Modules\Catalog\DTOs;

use App\Core\Abstracts\AbstractDTO;

/**
 * Class CreateAttributeValueDTO
 *
 * @package App\Modules\Catalog\DTOs
 */
class CreateAttributeValueDTO extends AbstractDTO
{
    public function __construct(
        public string $value,
        public ?string $slug = null,
        public ?string $color_hex = null,
        public int $sort_order = 0,
    ) {
    }
}
