<?php

declare(strict_types=1);

namespace App\Modules\CMS\Models;

use App\Core\Traits\Filterable;
use App\Core\Traits\HasUuid;
use App\Core\Traits\Sortable;
use App\Modules\Auth\Models\User;
use App\Modules\CMS\Database\Factories\PageFactory;
use App\Shared\Enums\PageStatus;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Class Page
 *
 * @property string $id
 * @property string $title
 * @property string $slug
 * @property string|null $content
 * @property string|null $excerpt
 * @property string $template
 * @property PageStatus $status
 * @property string|null $author_id
 * @property string|null $featured_image
 * @property string|null $meta_title
 * @property string|null $meta_description
 * @property Carbon|null $published_at
 * @property Carbon $created_at
 * @property Carbon $updated_at
 * @property Carbon|null $deleted_at
 *
 * @package App\Modules\CMS\Models
 */
class Page extends Model
{
    use HasFactory, HasUuid, SoftDeletes, Filterable, Sortable;

    protected $table = 'cms_pages';

    protected $fillable = [
        'title',
        'slug',
        'content',
        'excerpt',
        'template',
        'status',
        'author_id',
        'featured_image',
        'meta_title',
        'meta_description',
        'published_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => PageStatus::class,
            'published_at' => 'datetime',
        ];
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', PageStatus::PUBLISHED->value)
            ->where(function (Builder $q) {
                $q->whereNull('published_at')
                    ->orWhere('published_at', '<=', now());
            });
    }

    public function scopeDraft(Builder $query): Builder
    {
        return $query->where('status', PageStatus::DRAFT->value);
    }

    public function isPublished(): bool
    {
        return $this->status === PageStatus::PUBLISHED
            && ($this->published_at === null || $this->published_at->isPast());
    }

    protected static function newFactory(): PageFactory
    {
        return PageFactory::new();
    }
}
