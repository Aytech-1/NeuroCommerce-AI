<?php

declare(strict_types=1);

namespace App\Modules\Payment\Repositories;

use App\Core\Abstracts\AbstractRepository;
use App\Modules\Payment\Contracts\PaymentTransactionRepositoryInterface;
use App\Modules\Payment\Models\PaymentTransaction;

/**
 * Class EloquentPaymentTransactionRepository
 *
 * @package App\Modules\Payment\Repositories
 */
class EloquentPaymentTransactionRepository extends AbstractRepository implements PaymentTransactionRepositoryInterface
{
    public function __construct(PaymentTransaction $model)
    {
        parent::__construct($model);
    }

    public function recordTransaction(array $data): PaymentTransaction
    {
        /** @var PaymentTransaction $transaction */
        $transaction = $this->model->newQuery()->create($data);
        return $transaction;
    }
}
