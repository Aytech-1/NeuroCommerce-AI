<?php

declare(strict_types=1);

namespace App\Modules\Admin\Models;

use App\Core\Traits\Filterable;
use App\Core\Traits\HasUuid;
use App\Core\Traits\Sortable;
use App\Modules\Admin\Database\Factories\AnalyticsTrafficFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Class AnalyticsTraffic
 *
 * @property string $id
 * @property string $date
 * @property int $page_views
 * @property int $unique_visitors
 * @property int $sessions
 * @property int $avg_session_duration
 * @property float $bounce_rate
 * @property string $source
 * @property string $device_type
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 *
 * @package App\Modules\Admin\Models
 */
class AnalyticsTraffic extends Model
{
    use HasFactory;
    use HasUuid;
    use Filterable;
    use Sortable;

    protected $table = 'analytics_traffic';

    protected $fillable = [
        'date',
        'page_views',
        'unique_visitors',
        'sessions',
        'avg_session_duration',
        'bounce_rate',
        'source',
        'device_type',
    ];

    protected $casts = [
        'date' => 'date:Y-m-d',
        'page_views' => 'integer',
        'unique_visitors' => 'integer',
        'sessions' => 'integer',
        'avg_session_duration' => 'integer',
        'bounce_rate' => 'decimal:4',
    ];

    protected static function newFactory(): AnalyticsTrafficFactory
    {
        return AnalyticsTrafficFactory::new();
    }
}
