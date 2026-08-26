<?php

declare(strict_types=1);

namespace App\Modules\Order\Models;

use App\Core\Traits\HasUuid;
use App\Modules\Auth\Models\User;
use App\Modules\Order\Database\Factories\OrderStatusHistoryFactory;
use App\Modules\Order\Enums\OrderStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Class OrderStatusHistory
 *
 * Append-only historical ledger documenting state transitions and audit reasons.
 *
 * @package App\Modules\Order\Models
 * @property string $id
 * @property string $order_id
 * @property string|null $from_status
 * @property string $to_status
 * @property string|null $comment
 * @property string|null $changed_by
 * @property \Carbon\CarbonInterface $created_at
 * @property-read Order $order
 * @property-read User|null $changer
 */
class OrderStatusHistory extends Model
{
    use HasUuid;
    use HasFactory;

    public const UPDATED_AT = null;

    protected $table = 'order_status_history';

    protected $fillable = [
        'order_id',
        'from_status',
        'to_status',
        'comment',
        'changed_by',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    /**
     * Create a new factory instance for the model.
     */
    protected static function newFactory(): OrderStatusHistoryFactory
    {
        return OrderStatusHistoryFactory::new();
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'order_id');
    }

    public function changer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}
