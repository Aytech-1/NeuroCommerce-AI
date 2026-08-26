<?php

declare(strict_types=1);

namespace App\Modules\Admin\Models;

use App\Core\Traits\HasUuid;
use App\Modules\Auth\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use OwenIt\Auditing\Contracts\Audit as AuditContract;
use OwenIt\Auditing\Audit as AuditTrait;

/**
 * Class AuditLog
 *
 * @package App\Modules\Admin\Models
 */
class AuditLog extends Model implements AuditContract
{
    use HasUuid, AuditTrait;

    public $timestamps = false;

    protected $table = 'audit_logs';

    protected $guarded = [];

    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
        'tags' => 'array',
        'created_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function getSerializedDate(\DateTimeInterface $date): string
    {
        return $this->serializeDate($date);
    }
}
