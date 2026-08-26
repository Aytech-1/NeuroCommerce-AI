<?php

declare(strict_types=1);

namespace App\Modules\AI\Models;

use App\Core\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;

/**
 * Class AIModelVersion
 *
 * @package App\Modules\AI\Models
 */
class AIModelVersion extends Model
{
    use HasUuid;

    public $timestamps = false;

    protected $table = 'ai_model_versions';

    protected $fillable = [
        'version',
        'model_type',
        'file_path',
        'training_data_range',
        'training_records',
        'metrics',
        'is_active',
        'trained_at',
        'activated_at',
        'created_at',
    ];

    protected $casts = [
        'training_records' => 'integer',
        'metrics' => 'array',
        'is_active' => 'boolean',
        'trained_at' => 'datetime',
        'activated_at' => 'datetime',
        'created_at' => 'datetime',
    ];
}
