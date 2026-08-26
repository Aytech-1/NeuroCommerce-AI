<?php

declare(strict_types=1);

namespace App\Modules\CMS\Contracts;

use App\Core\Contracts\BaseRepositoryInterface;
use App\Modules\CMS\Models\Faq;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

/**
 * Interface FaqRepositoryInterface
 *
 * @package App\Modules\CMS\Contracts
 */
interface FaqRepositoryInterface extends BaseRepositoryInterface
{
    public function getActiveFaqs(?string $category = null): Collection;

    public function paginateAdmin(array $filters = [], int $perPage = 20): LengthAwarePaginator;
}
