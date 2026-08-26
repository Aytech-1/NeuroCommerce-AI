<?php

declare(strict_types=1);

namespace App\Modules\Catalog\DTOs;

use App\Core\Abstracts\AbstractDTO;

/**
 * Class UpdateCategoryDTO
 *
 * @package App\Modules\Catalog\DTOs
 */
class UpdateCategoryDTO extends AbstractDTO
{
    public function __construct(
        public ?string $name = null,
        public ?string $slug = null,
        public ?string $parent_id = null,
        public ?string $description = null,
        public ?string $image_url = null,
        public ?int $sort_order = null,
        public ?bool $is_active = null,
        public ?string $meta_title = null,
        public ?string $meta_description = null,
    ) {
    }
}
