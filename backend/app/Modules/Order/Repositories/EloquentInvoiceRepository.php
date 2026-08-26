<?php

declare(strict_types=1);

namespace App\Modules\Order\Repositories;

use App\Core\Abstracts\AbstractRepository;
use App\Modules\Order\Contracts\InvoiceRepositoryInterface;
use App\Modules\Order\Models\Invoice;
use Illuminate\Support\Str;

/**
 * Class EloquentInvoiceRepository
 *
 * @package App\Modules\Order\Repositories
 */
class EloquentInvoiceRepository extends AbstractRepository implements InvoiceRepositoryInterface
{
    public function __construct(Invoice $model)
    {
        parent::__construct($model);
    }

    public function findByOrderId(string $orderId): ?Invoice
    {
        /** @var Invoice|null $invoice */
        $invoice = $this->model->newQuery()
            ->where('order_id', $orderId)
            ->first();

        return $invoice;
    }

    public function findByInvoiceNumber(string $invoiceNumber): ?Invoice
    {
        /** @var Invoice|null $invoice */
        $invoice = $this->model->newQuery()
            ->where('invoice_number', $invoiceNumber)
            ->first();

        return $invoice;
    }

    public function generateInvoiceNumber(): string
    {
        $year = date('Y');
        $random = strtoupper(Str::random(6));
        $invNumber = "INV-{$year}-{$random}";

        while ($this->model->newQuery()->where('invoice_number', $invNumber)->exists()) {
            $random = strtoupper(Str::random(6));
            $invNumber = "INV-{$year}-{$random}";
        }

        return $invNumber;
    }
}
