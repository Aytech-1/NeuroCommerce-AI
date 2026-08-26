<?php

declare(strict_types=1);

namespace App\Modules\Admin\Models;

use App\Core\Traits\HasUuid;
use App\Modules\Auth\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Class AuditActivityLog
 *
 * @package App\Modules\Admin\Models
 */
class AuditActivityLog extends Model
{
    use HasUuid;

    public $timestamps = false;

    protected $table = 'audit_activity_logs';

    protected $fillable = [
        'user_id',
        'action',
        'description',
        'properties',
        'ip_address',
        'created_at',
    ];

    protected $casts = [
        'properties' => 'array',
        'created_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
