<?php

declare(strict_types=1);

namespace App\Modules\AI\Models;

use App\Core\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;

/**
 * Class AIFeatureStore
 *
 * @package App\Modules\AI\Models
 */
class AIFeatureStore extends Model
{
    use HasUuid;

    public $timestamps = false;

    protected $table = 'ai_feature_store';

    protected $fillable = [
        'entity_type',
        'entity_id',
        'feature_vector',
        'model_version',
        'computed_at',
        'expires_at',
        'created_at',
    ];

    protected $casts = [
        'feature_vector' => 'array',
        'computed_at' => 'datetime',
        'expires_at' => 'datetime',
        'created_at' => 'datetime',
    ];
}
