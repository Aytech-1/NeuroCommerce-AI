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

    public function paginateForAdmin(array $filters = [], int $perPage = 20): \Illuminate\Contracts\Pagination\LengthAwarePaginator
    {
        $query = $this->model->newQuery()
            ->with(['order.user', 'order.items', 'order.billingAddress', 'order.shippingAddress'])
            ->orderBy('created_at', 'desc');

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['currency_code'])) {
            $query->where('currency_code', $filters['currency_code']);
        }

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('invoice_number', 'LIKE', "%{$search}%")
                    ->orWhereHas('order', function ($oq) use ($search) {
                        $oq->where('order_number', 'LIKE', "%{$search}%")
                            ->orWhereHas('user', function ($uq) use ($search) {
                                $uq->where('name', 'LIKE', "%{$search}%")
                                    ->orWhere('email', 'LIKE', "%{$search}%");
                            });
                    });
            });
        }

        return $query->paginate($perPage);
    }
}
