<?php

declare(strict_types=1);

namespace App\Modules\Auth\Models;

use App\Core\Traits\Auditable;
use App\Core\Traits\Filterable;
use App\Core\Traits\HasUuid;
use App\Core\Traits\Sortable;
use Illuminate\Auth\Authenticatable;
use Illuminate\Auth\MustVerifyEmail as MustVerifyEmailTrait;
use Illuminate\Auth\Passwords\CanResetPassword;
use Illuminate\Contracts\Auth\Access\Authorizable as AuthorizableContract;
use Illuminate\Contracts\Auth\Authenticatable as AuthenticatableContract;
use Illuminate\Contracts\Auth\CanResetPassword as CanResetPasswordContract;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\Access\Authorizable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use OwenIt\Auditing\Contracts\Auditable as AuditableContract;
use Spatie\Permission\Traits\HasRoles;

/**
 * Class User
 *
 * Enterprise central identity and authentication entity.
 *
 * @package App\Modules\Auth\Models
 */
class User extends Model implements
    AuthenticatableContract,
    AuthorizableContract,
    CanResetPasswordContract,
    MustVerifyEmail,
    AuditableContract
{
    use Authenticatable;
    use Authorizable;
    use CanResetPassword;
    use MustVerifyEmailTrait;
    use HasApiTokens;
    use HasRoles;
    use HasUuid;
    use HasFactory;
    use Notifiable;
    use SoftDeletes;
    use Auditable;
    use \OwenIt\Auditing\Auditable;
    use Filterable;
    use Sortable;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'users';

    /**
     * The primary key type.
     *
     * @var string
     */
    protected $keyType = 'string';

    /**
     * Indicates if the IDs are auto-incrementing.
     *
     * @var bool
     */
    public $incrementing = false;

    /**
     * Guard name for Spatie Permission.
     *
     * @var string
     */
    protected string $guard_name = 'api';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'email_verified_at',
        'password',
        'phone',
        'avatar',
        'user_type',
        'is_active',
        'last_login_at',
        'last_login_ip',
        'two_factor_secret',
        'two_factor_enabled',
        'locale',
        'currency_code',
        'timezone',
        'metadata',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_secret',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_active' => 'boolean',
        'two_factor_enabled' => 'boolean',
        'email_verified_at' => 'datetime',
        'last_login_at' => 'datetime',
        'metadata' => 'json',
        'password' => 'hashed',
    ];

    /**
     * Get the user's full name.
     *
     * @return string
     */
    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }

    /**
     * Get the customer profile associated with the user.
     *
     * @return HasOne
     */
    public function customerProfile(): HasOne
    {
        return $this->hasOne(CustomerProfile::class, 'user_id');
    }

    /**
     * Get the staff profile associated with the user.
     *
     * @return HasOne
     */
    public function staffProfile(): HasOne
    {
        return $this->hasOne(StaffProfile::class, 'user_id');
    }

    /**
     * Get all addresses associated with the user.
     *
     * @return MorphMany
     */
    public function addresses(): MorphMany
    {
        return $this->morphMany(Address::class, 'addressable');
    }

    /**
     * Get all active sessions for the user.
     *
     * @return HasMany
     */
    public function sessions(): HasMany
    {
        return $this->hasMany(CustomerSession::class, 'user_id');
    }

    /**
     * Check if user is a Super Admin.
     *
     * @return bool
     */
    public function isSuperAdmin(): bool
    {
        return $this->user_type === 'super_admin' || $this->hasRole('super_admin');
    }

    /**
     * Check if user is an Admin.
     *
     * @return bool
     */
    public function isAdmin(): bool
    {
        return in_array($this->user_type, ['admin', 'super_admin'], true) || $this->hasRole('admin') || $this->hasRole('super_admin');
    }

    /**
     * Check if user is a Store Manager.
     *
     * @return bool
     */
    public function isManager(): bool
    {
        return $this->user_type === 'staff' && $this->hasRole('manager');
    }

    /**
     * Check if user is Staff.
     *
     * @return bool
     */
    public function isStaff(): bool
    {
        return in_array($this->user_type, ['staff', 'admin', 'super_admin'], true);
    }

    /**
     * Check if user is a Customer.
     *
     * @return bool
     */
    public function isCustomer(): bool
    {
        return $this->user_type === 'customer';
    }

    /**
     * Create a new factory instance for the model.
     */
    protected static function newFactory(): \App\Modules\Auth\Database\Factories\UserFactory
    {
        return \App\Modules\Auth\Database\Factories\UserFactory::new();
    }

    /**
     * Check if user account is active.
     *
     * @return bool
     */
    public function isActive(): bool
    {
        return (bool) $this->is_active;
    }
}
