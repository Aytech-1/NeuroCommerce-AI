<?php

declare(strict_types=1);

namespace App\Modules\CMS\Models;

use App\Core\Traits\Filterable;
use App\Core\Traits\HasUuid;
use App\Core\Traits\Sortable;
use App\Modules\CMS\Database\Factories\TestimonialFactory;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Class Testimonial
 *
 * @property string $id
 * @property string $customer_name
 * @property string|null $company
 * @property string $content
 * @property int $rating
 * @property string|null $avatar_url
 * @property bool $is_active
 * @property int $sort_order
 * @property Carbon $created_at
 * @property Carbon $updated_at
 *
 * @package App\Modules\CMS\Models
 */
class Testimonial extends Model
{
    use HasFactory, HasUuid, Filterable, Sortable;

    protected $table = 'cms_testimonials';

    protected $fillable = [
        'customer_name',
        'company',
        'content',
        'rating',
        'avatar_url',
        'is_active',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'rating' => 'integer',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    protected static function newFactory(): TestimonialFactory
    {
        return TestimonialFactory::new();
    }
}
