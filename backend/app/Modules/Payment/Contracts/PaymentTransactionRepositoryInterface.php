<?php

declare(strict_types=1);

namespace App\Modules\Payment\Contracts;

use App\Core\Contracts\BaseRepositoryInterface;
use App\Modules\Payment\Models\PaymentTransaction;

/**
 * Interface PaymentTransactionRepositoryInterface
 *
 * @package App\Modules\Payment\Contracts
 */
interface PaymentTransactionRepositoryInterface extends BaseRepositoryInterface
{
    public function recordTransaction(array $data): PaymentTransaction;
}
