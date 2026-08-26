<?php

declare(strict_types=1);

namespace App\Modules\Catalog\DTOs;

use App\Core\Abstracts\AbstractDTO;

/**
 * Class UpdateAttributeDTO
 *
 * @package App\Modules\Catalog\DTOs
 */
class UpdateAttributeDTO extends AbstractDTO
{
    public function __construct(
        public ?string $name = null,
        public ?string $slug = null,
        public ?string $type = null,
        public ?bool $is_filterable = null,
        public ?bool $is_variant = null,
        public ?int $sort_order = null,
    ) {
    }
}
