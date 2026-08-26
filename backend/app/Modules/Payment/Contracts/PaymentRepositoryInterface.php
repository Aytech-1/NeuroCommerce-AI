<?php

declare(strict_types=1);

namespace App\Modules\Payment\Contracts;

use App\Core\Contracts\BaseRepositoryInterface;
use App\Modules\Payment\Models\Payment;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * Interface PaymentRepositoryInterface
 *
 * @package App\Modules\Payment\Contracts
 */
interface PaymentRepositoryInterface extends BaseRepositoryInterface
{
    public function findByOrderId(string $orderId): ?Payment;

    public function findByGatewayPaymentId(string $gateway, string $gatewayPaymentId): ?Payment;

    public function paginateForAdmin(array $filters = [], int $perPage = 20): LengthAwarePaginator;

    public function createPayment(array $data): Payment;
}
