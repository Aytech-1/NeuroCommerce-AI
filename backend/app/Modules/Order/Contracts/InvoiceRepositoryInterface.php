<?php

declare(strict_types=1);

namespace App\Modules\Order\Contracts;

use App\Core\Contracts\BaseRepositoryInterface;
use App\Modules\Order\Models\Invoice;

/**
 * Interface InvoiceRepositoryInterface
 *
 * @package App\Modules\Order\Contracts
 */
interface InvoiceRepositoryInterface extends BaseRepositoryInterface
{
    public function findByOrderId(string $orderId): ?Invoice;

    public function findByInvoiceNumber(string $invoiceNumber): ?Invoice;

    public function generateInvoiceNumber(): string;
}
