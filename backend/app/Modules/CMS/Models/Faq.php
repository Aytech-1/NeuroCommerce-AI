<?php

declare(strict_types=1);

namespace App\Modules\CMS\Models;

use App\Core\Traits\Filterable;
use App\Core\Traits\HasUuid;
use App\Core\Traits\Sortable;
use App\Modules\CMS\Database\Factories\FaqFactory;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Class Faq
 *
 * @property string $id
 * @property string $question
 * @property string $answer
 * @property string|null $category
 * @property int $sort_order
 * @property bool $is_active
 * @property Carbon $created_at
 * @property Carbon $updated_at
 *
 * @package App\Modules\CMS\Models
 */
class Faq extends Model
{
    use HasFactory, HasUuid, Filterable, Sortable;

    protected $table = 'cms_faqs';

    protected $fillable = [
        'question',
        'answer',
        'category',
        'sort_order',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeCategory(Builder $query, string $category): Builder
    {
        return $query->where('category', $category);
    }

    protected static function newFactory(): FaqFactory
    {
        return FaqFactory::new();
    }
}
