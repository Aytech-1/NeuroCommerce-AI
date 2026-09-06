<?php

declare(strict_types=1);

namespace App\Modules\Cart\Models;

use App\Core\Traits\Auditable;
use App\Core\Traits\HasUuid;
use App\Core\ValueObjects\Money;
use App\Modules\Auth\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use OwenIt\Auditing\Contracts\Auditable as AuditableContract;

/**
 * Cart Eloquent Model
 *
 * Represents an active shopping cart for an authenticated customer or guest session.
 *
 * @property string $id
 * @property string|null $user_id
 * @property string|null $session_id
 * @property string|null $coupon_id
 * @property string $currency_code
 * @property string|null $notes
 * @property \Illuminate\Support\Carbon|null $expires_at
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon $updated_at
 */
class Cart extends Model implements AuditableContract
{
    use HasUuid;
    use Auditable;
    use HasFactory;

    protected $table = 'carts';

    protected $fillable = [
        'user_id',
        'session_id',
        'coupon_id',
        'currency_code',
        'notes',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
        ];
    }

    /**
     * User owning the cart (null for guest carts).
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Line items in the cart.
     */
    public function items(): HasMany
    {
        return $this->hasMany(CartItem::class, 'cart_id');
    }

    /**
     * Check if this is an anonymous guest cart.
     */
    public function isGuest(): bool
    {
        return $this->user_id === null;
    }

    /**
     * Check if cart is expired.
     */
    public function isExpired(): bool
    {
        return $this->expires_at !== null && $this->expires_at->isPast();
    }

    /**
     * Total quantity of items in the cart.
     */
    public function getItemCountAttribute(): int
    {
        return (int) $this->items->sum('quantity');
    }

    /**
     * Calculate cart subtotal as a Money ValueObject.
     */
    public function calculateSubtotal(): Money
    {
        $currency = $this->currency_code ?: (string) config('neurocommerce.currency.default', 'NGN');
        $totalCents = 0;

        foreach ($this->items as $item) {
            $itemMoney = Money::fromDecimal((float) $item->unit_price, $currency);
            $totalCents += $itemMoney->getAmount() * $item->quantity;
        }

        return Money::fromCents($totalCents, $currency);
    }

    /**
     * Scope for finding cart by user ID.
     */
    public function scopeForUser(Builder $query, string $userId): Builder
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope for finding cart by session ID.
     */
    public function scopeForSession(Builder $query, string $sessionId): Builder
    {
        return $query->where('session_id', $sessionId)->whereNull('user_id');
    }

    /**
     * Scope for finding expired guest carts.
     */
    public function scopeExpired(Builder $query): Builder
    {
        return $query->whereNotNull('expires_at')->where('expires_at', '<=', now());
    }

    /**
     * Create a new factory instance for the model.
     */
    protected static function newFactory()
    {
        return \App\Modules\Cart\Database\Factories\CartFactory::new();
    }
}
