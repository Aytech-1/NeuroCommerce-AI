<?php

declare(strict_types=1);

namespace App\Modules\AI\Models;

use App\Core\Traits\HasUuid;
use App\Modules\Auth\Models\User;
use App\Modules\Catalog\Models\Category;
use App\Modules\Catalog\Models\Product;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Class AIBehaviorEvent
 *
 * @package App\Modules\AI\Models
 */
class AIBehaviorEvent extends Model
{
    use HasUuid;

    public $timestamps = false;

    protected $table = 'ai_behavior_events';

    protected $fillable = [
        'user_id',
        'session_id',
        'event_type',
        'product_id',
        'category_id',
        'search_query',
        'page_url',
        'referrer_url',
        'duration_seconds',
        'scroll_depth',
        'device_type',
        'ip_address',
        'user_agent',
        'metadata',
        'created_at',
    ];

    protected $casts = [
        'duration_seconds' => 'integer',
        'scroll_depth' => 'integer',
        'metadata' => 'array',
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

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'category_id');
    }
}
