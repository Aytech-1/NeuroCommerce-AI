<?php

declare(strict_types=1);

namespace App\Modules\Payment\Models;

use App\Core\Traits\Auditable;
use App\Core\Traits\HasUuid;
use App\Core\ValueObjects\Money;
use App\Modules\Order\Models\Order;
use App\Modules\Payment\Database\Factories\PaymentFactory;
use App\Modules\Payment\Enums\PaymentStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use OwenIt\Auditing\Contracts\Auditable as AuditableContract;

/**
 * Class Payment
 *
 * @package App\Modules\Payment\Models
 * @property string $id
 * @property string $order_id
 * @property string $gateway
 * @property string|null $gateway_payment_id
 * @property string $method
 * @property PaymentStatus $status
 * @property float $amount
 * @property string $currency_code
 * @property string|null $card_last_four
 * @property string|null $card_brand
 * @property array|null $metadata
 * @property \Carbon\CarbonInterface|null $paid_at
 * @property \Carbon\CarbonInterface|null $failed_at
 * @property string|null $failure_reason
 * @property \Carbon\CarbonInterface $created_at
 * @property \Carbon\CarbonInterface $updated_at
 * @property-read Order $order
 * @property-read Collection|PaymentTransaction[] $transactions
 * @property-read Collection|Refund[] $refunds
 */
class Payment extends Model implements AuditableContract
{
    use HasUuid;
    use Auditable;
    use \OwenIt\Auditing\Auditable;
    use HasFactory;

    protected $table = 'payments';

    protected $fillable = [
        'order_id',
        'gateway',
        'gateway_payment_id',
        'method',
        'status',
        'amount',
        'currency_code',
        'card_last_four',
        'card_brand',
        'metadata',
        'paid_at',
        'failed_at',
        'failure_reason',
    ];

    protected $casts = [
        'status' => PaymentStatus::class,
        'amount' => 'float',
        'metadata' => 'array',
        'paid_at' => 'datetime',
        'failed_at' => 'datetime',
    ];

    protected static function newFactory(): PaymentFactory
    {
        return PaymentFactory::new();
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'order_id');
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(PaymentTransaction::class, 'payment_id')->orderBy('created_at', 'desc');
    }

    public function refunds(): HasMany
    {
        return $this->hasMany(Refund::class, 'payment_id')->orderBy('created_at', 'desc');
    }

    public function calculateTotalRefunded(): float
    {
        return (float) $this->refunds()
            ->whereIn('status', ['approved', 'processed'])
            ->sum('amount');
    }

    public function getRemainingRefundableAmount(): float
    {
        $refunded = $this->calculateTotalRefunded();
        return max(0.0, (float) $this->amount - $refunded);
    }

    public function toMoney(): Money
    {
        return Money::fromDecimal((float) $this->amount, $this->currency_code);
    }
}
