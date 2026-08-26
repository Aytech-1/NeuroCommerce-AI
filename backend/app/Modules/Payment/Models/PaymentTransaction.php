<?php

declare(strict_types=1);

namespace App\Modules\Payment\Models;

use App\Core\Traits\HasUuid;
use App\Modules\Payment\Database\Factories\PaymentTransactionFactory;
use App\Modules\Payment\Enums\TransactionStatus;
use App\Modules\Payment\Enums\TransactionType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Class PaymentTransaction
 *
 * Append-only immutable financial event ledger.
 *
 * @package App\Modules\Payment\Models
 * @property string $id
 * @property string $payment_id
 * @property TransactionType $type
 * @property float $amount
 * @property string $currency_code
 * @property string|null $gateway_transaction_id
 * @property TransactionStatus $status
 * @property array|null $response_data
 * @property \Carbon\CarbonInterface $created_at
 * @property-read Payment $payment
 */
class PaymentTransaction extends Model
{
    use HasUuid;
    use HasFactory;

    public const UPDATED_AT = null;

    protected $table = 'pay_transactions';

    protected $fillable = [
        'payment_id',
        'type',
        'amount',
        'currency_code',
        'gateway_transaction_id',
        'status',
        'response_data',
    ];

    protected $casts = [
        'type' => TransactionType::class,
        'status' => TransactionStatus::class,
        'amount' => 'float',
        'response_data' => 'array',
        'created_at' => 'datetime',
    ];

    protected static function newFactory(): PaymentTransactionFactory
    {
        return PaymentTransactionFactory::new();
    }

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class, 'payment_id');
    }
}
