<?php

declare(strict_types=1);

namespace App\Modules\Admin\Models;

use App\Core\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;

/**
 * Class FeatureFlag
 *
 * @package App\Modules\Admin\Models
 */
class FeatureFlag extends Model
{
    use HasUuid;

    protected $table = 'sys_feature_flags';

    protected $fillable = [
        'name',
        'is_enabled',
        'rollout_percentage',
        'description',
        'metadata',
    ];

    protected $casts = [
        'is_enabled' => 'boolean',
        'rollout_percentage' => 'integer',
        'metadata' => 'array',
    ];
}
