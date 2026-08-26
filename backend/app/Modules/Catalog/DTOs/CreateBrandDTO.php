<?php

declare(strict_types=1);

namespace App\Modules\Catalog\DTOs;

use App\Core\Abstracts\AbstractDTO;

/**
 * Class CreateBrandDTO
 *
 * @package App\Modules\Catalog\DTOs
 */
class CreateBrandDTO extends AbstractDTO
{
    public function __construct(
        public string $name,
        public ?string $slug = null,
        public ?string $description = null,
        public ?string $logo_url = null,
        public ?string $website_url = null,
        public bool $is_active = true,
        public int $sort_order = 0,
    ) {
    }
}
