<?php

declare(strict_types=1);

namespace App\Modules\CMS\Contracts;

use App\Core\Contracts\BaseRepositoryInterface;
use App\Modules\CMS\Models\Banner;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

/**
 * Interface BannerRepositoryInterface
 *
 * @package App\Modules\CMS\Contracts
 */
interface BannerRepositoryInterface extends BaseRepositoryInterface
{
    public function getActiveBanners(?string $position = null): Collection;

    public function paginateAdmin(array $filters = [], int $perPage = 20): LengthAwarePaginator;
}
