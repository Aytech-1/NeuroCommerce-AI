<?php

declare(strict_types=1);

namespace App\Modules\Catalog\DTOs;

use App\Core\Abstracts\AbstractDTO;

/**
 * Class UpdateBrandDTO
 *
 * @package App\Modules\Catalog\DTOs
 */
class UpdateBrandDTO extends AbstractDTO
{
    public function __construct(
        public ?string $name = null,
        public ?string $slug = null,
        public ?string $description = null,
        public ?string $logo_url = null,
        public ?string $website_url = null,
        public ?bool $is_active = null,
        public ?int $sort_order = null,
    ) {
    }
}
