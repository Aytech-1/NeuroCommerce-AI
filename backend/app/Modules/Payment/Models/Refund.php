<?php

declare(strict_types=1);

namespace App\Modules\Payment\Models;

use App\Core\Traits\Auditable;
use App\Core\Traits\HasUuid;
use App\Modules\Auth\Models\User;
use App\Modules\Order\Models\Order;
use App\Modules\Payment\Database\Factories\RefundFactory;
use App\Modules\Payment\Enums\RefundStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use OwenIt\Auditing\Contracts\Auditable as AuditableContract;

/**
 * Class Refund
 *
 * @package App\Modules\Payment\Models
 * @property string $id
 * @property string $payment_id
 * @property string $order_id
 * @property float $amount
 * @property string|null $reason
 * @property RefundStatus $status
 * @property string|null $gateway_refund_id
 * @property string|null $processed_by
 * @property \Carbon\CarbonInterface|null $processed_at
 * @property \Carbon\CarbonInterface $created_at
 * @property \Carbon\CarbonInterface $updated_at
 * @property-read Payment $payment
 * @property-read Order $order
 * @property-read User|null $processor
 */
class Refund extends Model implements AuditableContract
{
    use HasUuid;
    use Auditable;
    use \OwenIt\Auditing\Auditable;
    use HasFactory;

    protected $table = 'pay_refunds';

    protected $fillable = [
        'payment_id',
        'order_id',
        'amount',
        'reason',
        'status',
        'gateway_refund_id',
        'processed_by',
        'processed_at',
    ];

    protected $casts = [
        'status' => RefundStatus::class,
        'amount' => 'float',
        'processed_at' => 'datetime',
    ];

    protected static function newFactory(): RefundFactory
    {
        return RefundFactory::new();
    }

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class, 'payment_id');
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'order_id');
    }

    public function processor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }
}
