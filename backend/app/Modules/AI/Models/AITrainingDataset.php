<?php

declare(strict_types=1);

namespace App\Modules\AI\Models;

use App\Core\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;

/**
 * Class AITrainingDataset
 *
 * @package App\Modules\AI\Models
 */
class AITrainingDataset extends Model
{
    use HasUuid;

    public $timestamps = false;

    protected $table = 'ai_training_datasets';

    protected $fillable = [
        'model_version',
        'dataset_type',
        'file_path',
        'record_count',
        'file_size_bytes',
        'checksum',
        'created_at',
    ];

    protected $casts = [
        'record_count' => 'integer',
        'file_size_bytes' => 'integer',
        'created_at' => 'datetime',
    ];
}
