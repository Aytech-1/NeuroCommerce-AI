<?php

declare(strict_types=1);

namespace App\Modules\AI\Models;

use App\Core\Traits\HasUuid;
use App\Modules\Auth\Models\User;
use App\Modules\Catalog\Models\Product;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Class AIRecommendation
 *
 * @package App\Modules\AI\Models
 */
class AIRecommendation extends Model
{
    use HasUuid;

    public $timestamps = false;

    protected $table = 'ai_recommendations';

    protected $fillable = [
        'user_id',
        'strategy',
        'product_id',
        'score',
        'rank',
        'model_version',
        'context',
        'generated_at',
        'expires_at',
        'created_at',
    ];

    protected $casts = [
        'score' => 'float',
        'rank' => 'integer',
        'context' => 'array',
        'generated_at' => 'datetime',
        'expires_at' => 'datetime',
        'created_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id');
    }
}
