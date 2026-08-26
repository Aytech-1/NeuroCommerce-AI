<?php

declare(strict_types=1);

namespace App\Modules\Admin\Models;

use App\Core\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;

/**
 * Class SystemConfig
 *
 * @package App\Modules\Admin\Models
 */
class SystemConfig extends Model
{
    use HasUuid;

    protected $table = 'sys_system_configs';

    protected $fillable = [
        'namespace',
        'key',
        'config_value',
    ];

    protected $casts = [
        'config_value' => 'array',
    ];
}
