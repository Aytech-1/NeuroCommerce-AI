<?php

declare(strict_types=1);

namespace App\Modules\Auth\Models;

use App\Core\Traits\HasUuid;
use Spatie\Permission\Models\Role as SpatieRole;

/**
 * Class Role
 *
 * Enterprise RBAC Role entity using UUID v7.
 *
 * @package App\Modules\Auth\Models
 */
class Role extends SpatieRole
{
    use HasUuid;

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
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'guard_name',
        'description',
        'is_system',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_system' => 'boolean',
    ];
}
