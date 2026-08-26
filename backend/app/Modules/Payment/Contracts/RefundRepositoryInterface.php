<?php

declare(strict_types=1);

namespace App\Modules\Payment\Contracts;

use App\Core\Contracts\BaseRepositoryInterface;
use App\Modules\Payment\Models\Refund;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * Interface RefundRepositoryInterface
 *
 * @package App\Modules\Payment\Contracts
 */
interface RefundRepositoryInterface extends BaseRepositoryInterface
{
    public function paginateForAdmin(array $filters = [], int $perPage = 20): LengthAwarePaginator;

    public function createRefund(array $data): Refund;
}
