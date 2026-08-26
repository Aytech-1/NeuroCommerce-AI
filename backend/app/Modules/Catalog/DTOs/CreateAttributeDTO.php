<?php

declare(strict_types=1);

namespace App\Modules\Catalog\DTOs;

use App\Core\Abstracts\AbstractDTO;

/**
 * Class CreateAttributeDTO
 *
 * @package App\Modules\Catalog\DTOs
 */
class CreateAttributeDTO extends AbstractDTO
{
    public function __construct(
        public string $name,
        public ?string $slug = null,
        public string $type = 'select',
        public bool $is_filterable = false,
        public bool $is_variant = false,
        public int $sort_order = 0,
    ) {
    }
}
