<?php

declare(strict_types=1);

namespace App\Modules\CMS\Contracts;

use App\Core\Contracts\BaseRepositoryInterface;
use App\Modules\CMS\Models\MediaFile;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * Interface MediaFileRepositoryInterface
 *
 * @package App\Modules\CMS\Contracts
 */
interface MediaFileRepositoryInterface extends BaseRepositoryInterface
{
    public function paginateFiles(array $filters = [], int $perPage = 20): LengthAwarePaginator;
}
