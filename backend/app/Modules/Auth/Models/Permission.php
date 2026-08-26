<?php

declare(strict_types=1);

namespace App\Modules\Auth\Models;

use App\Core\Traits\HasUuid;
use Spatie\Permission\Models\Permission as SpatiePermission;

/**
 * Class Permission
 *
 * Enterprise RBAC Permission entity using UUID v7.
 *
 * @package App\Modules\Auth\Models
 */
class Permission extends SpatiePermission
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
        'module',
        'description',
    ];
}
