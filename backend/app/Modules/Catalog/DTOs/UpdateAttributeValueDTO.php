<?php

declare(strict_types=1);

namespace App\Modules\Catalog\DTOs;

use App\Core\Abstracts\AbstractDTO;

/**
 * Class UpdateAttributeValueDTO
 *
 * @package App\Modules\Catalog\DTOs
 */
class UpdateAttributeValueDTO extends AbstractDTO
{
    public function __construct(
        public ?string $value = null,
        public ?string $slug = null,
        public ?string $color_hex = null,
        public ?int $sort_order = null,
    ) {
    }
}
