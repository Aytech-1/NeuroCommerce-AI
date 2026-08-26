<?php

declare(strict_types=1);

namespace App\Modules\Order\Models;

use App\Core\Traits\Auditable;
use App\Core\Traits\HasUuid;
use App\Core\ValueObjects\Money;
use App\Modules\Auth\Models\Address;
use App\Modules\Auth\Models\User;
use App\Modules\Order\Database\Factories\OrderFactory;
use App\Modules\Order\Enums\OrderStatus;
use Database\Factories\OrderFactory as GlobalOrderFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

use OwenIt\Auditing\Contracts\Auditable as AuditableContract;

/**
 * Class Order
 *
 * Immutable transactional order aggregate capturing the snapshot of purchase,
 * pricing, taxes, delivery details, and lifecycle states.
 *
 * @package App\Modules\Order\Models
 * @property string $id
 * @property string $order_number
 * @property string|null $user_id
 * @property OrderStatus $status
 * @property string $currency_code
 * @property string $subtotal
 * @property string $tax_amount
 * @property string $shipping_amount
 * @property string $discount_amount
 * @property string $total_amount
 * @property int $item_count
 * @property string|null $coupon_id
 * @property string|null $coupon_code
 * @property string|null $billing_address_id
 * @property string|null $shipping_address_id
 * @property string|null $shipping_method
 * @property string|null $payment_method
 * @property string|null $notes
 * @property string|null $admin_notes
 * @property string|null $ip_address
 * @property string|null $user_agent
 * @property \Carbon\CarbonInterface|null $placed_at
 * @property \Carbon\CarbonInterface|null $paid_at
 * @property \Carbon\CarbonInterface|null $shipped_at
 * @property \Carbon\CarbonInterface|null $delivered_at
 * @property \Carbon\CarbonInterface|null $cancelled_at
 * @property \Carbon\CarbonInterface $created_at
 * @property \Carbon\CarbonInterface $updated_at
 * @property \Carbon\CarbonInterface|null $deleted_at
 * @property-read User|null $user
 * @property-read Collection|OrderItem[] $items
 * @property-read Collection|OrderStatusHistory[] $statusHistory
 * @property-read Collection|Invoice[] $invoices
 * @property-read Address|null $billingAddress
 * @property-read Address|null $shippingAddress
 */
class Order extends Model implements AuditableContract
{
    use HasUuid;
    use Auditable;
    use \OwenIt\Auditing\Auditable;
    use HasFactory;
    use SoftDeletes;

    protected $table = 'orders';

    protected $fillable = [
        'order_number',
        'user_id',
        'status',
        'currency_code',
        'subtotal',
        'tax_amount',
        'shipping_amount',
        'discount_amount',
        'total_amount',
        'item_count',
        'coupon_id',
        'coupon_code',
        'billing_address_id',
        'shipping_address_id',
        'shipping_method',
        'payment_method',
        'notes',
        'admin_notes',
        'ip_address',
        'user_agent',
        'placed_at',
        'paid_at',
        'shipped_at',
        'delivered_at',
        'cancelled_at',
    ];

    protected $casts = [
        'status' => OrderStatus::class,
        'subtotal' => 'float',
        'tax_amount' => 'float',
        'shipping_amount' => 'float',
        'discount_amount' => 'float',
        'total_amount' => 'float',
        'item_count' => 'integer',
        'placed_at' => 'datetime',
        'paid_at' => 'datetime',
        'shipped_at' => 'datetime',
        'delivered_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    /**
     * Create a new factory instance for the model.
     */
    protected static function newFactory(): OrderFactory
    {
        return OrderFactory::new();
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class, 'order_id');
    }

    public function statusHistory(): HasMany
    {
        return $this->hasMany(OrderStatusHistory::class, 'order_id')->orderBy('created_at', 'desc');
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class, 'order_id');
    }

    public function billingAddress(): BelongsTo
    {
        return $this->belongsTo(Address::class, 'billing_address_id');
    }

    public function shippingAddress(): BelongsTo
    {
        return $this->belongsTo(Address::class, 'shipping_address_id');
    }

    public function scopeForUser(Builder $query, string $userId): Builder
    {
        return $query->where('user_id', $userId);
    }

    public function scopeWithStatus(Builder $query, OrderStatus|string $status): Builder
    {
        $statusVal = $status instanceof OrderStatus ? $status->value : $status;
        return $query->where('status', $statusVal);
    }

    public function scopeRecent(Builder $query): Builder
    {
        return $query->orderBy('created_at', 'desc');
    }

    public function calculateSubtotal(): Money
    {
        return Money::fromDecimal((float) $this->subtotal, $this->currency_code);
    }

    public function calculateTotal(): Money
    {
        return Money::fromDecimal((float) $this->total_amount, $this->currency_code);
    }

    public function isPaid(): bool
    {
        return in_array($this->status, [OrderStatus::PAID, OrderStatus::PROCESSING, OrderStatus::SHIPPED, OrderStatus::DELIVERED], true);
    }

    public function isCancelled(): bool
    {
        return $this->status === OrderStatus::CANCELLED;
    }
}
