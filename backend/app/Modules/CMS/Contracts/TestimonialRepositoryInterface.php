<?php

declare(strict_types=1);

namespace App\Modules\CMS\Contracts;

use App\Core\Contracts\BaseRepositoryInterface;
use App\Modules\CMS\Models\Testimonial;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

/**
 * Interface TestimonialRepositoryInterface
 *
 * @package App\Modules\CMS\Contracts
 */
interface TestimonialRepositoryInterface extends BaseRepositoryInterface
{
    public function getActiveTestimonials(): Collection;

    public function paginateAdmin(array $filters = [], int $perPage = 20): LengthAwarePaginator;
}
