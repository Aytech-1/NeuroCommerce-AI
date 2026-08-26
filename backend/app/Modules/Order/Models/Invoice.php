<?php

declare(strict_types=1);

namespace App\Modules\Order\Models;

use App\Core\Traits\HasUuid;
use App\Core\ValueObjects\Money;
use App\Modules\Order\Database\Factories\InvoiceFactory;
use App\Modules\Order\Enums\InvoiceStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Class Invoice
 *
 * Commercial billing invoice generated for orders.
 *
 * @package App\Modules\Order\Models
 * @property string $id
 * @property string $order_id
 * @property string $invoice_number
 * @property InvoiceStatus $status
 * @property string $subtotal
 * @property string $tax_amount
 * @property string $total_amount
 * @property string $currency_code
 * @property \Carbon\CarbonInterface|null $issued_at
 * @property \Carbon\CarbonInterface|null $due_at
 * @property \Carbon\CarbonInterface|null $paid_at
 * @property string|null $pdf_url
 * @property \Carbon\CarbonInterface $created_at
 * @property \Carbon\CarbonInterface $updated_at
 * @property-read Order $order
 */
class Invoice extends Model
{
    use HasUuid;
    use HasFactory;

    protected $table = 'invoices';

    protected $fillable = [
        'order_id',
        'invoice_number',
        'status',
        'subtotal',
        'tax_amount',
        'total_amount',
        'currency_code',
        'issued_at',
        'due_at',
        'paid_at',
        'pdf_url',
    ];

    protected $casts = [
        'status' => InvoiceStatus::class,
        'subtotal' => 'float',
        'tax_amount' => 'float',
        'total_amount' => 'float',
        'issued_at' => 'datetime',
        'due_at' => 'datetime',
        'paid_at' => 'datetime',
    ];

    /**
     * Create a new factory instance for the model.
     */
    protected static function newFactory(): InvoiceFactory
    {
        return InvoiceFactory::new();
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'order_id');
    }

    public function calculateTotal(): Money
    {
        return Money::fromDecimal((float) $this->total_amount, $this->currency_code);
    }
}
