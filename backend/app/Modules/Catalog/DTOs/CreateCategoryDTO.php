<?php

declare(strict_types=1);

namespace App\Modules\Catalog\DTOs;

use App\Core\Abstracts\AbstractDTO;

/**
 * Class CreateCategoryDTO
 *
 * @package App\Modules\Catalog\DTOs
 */
class CreateCategoryDTO extends AbstractDTO
{
    public function __construct(
        public string $name,
        public ?string $slug = null,
        public ?string $parent_id = null,
        public ?string $description = null,
        public ?string $image_url = null,
        public int $sort_order = 0,
        public bool $is_active = true,
        public ?string $meta_title = null,
        public ?string $meta_description = null,
    ) {
    }
}
