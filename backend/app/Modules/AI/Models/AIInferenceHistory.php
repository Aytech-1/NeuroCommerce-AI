<?php

declare(strict_types=1);

namespace App\Modules\AI\Models;

use App\Core\Traits\HasUuid;
use App\Modules\Auth\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Class AIInferenceHistory
 *
 * @package App\Modules\AI\Models
 */
class AIInferenceHistory extends Model
{
    use HasUuid;

    public $timestamps = false;

    protected $table = 'ai_inference_history';

    protected $fillable = [
        'user_id',
        'model_version',
        'input_features',
        'output_scores',
        'latency_ms',
        'created_at',
    ];

    protected $casts = [
        'input_features' => 'array',
        'output_scores' => 'array',
        'latency_ms' => 'integer',
        'created_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
