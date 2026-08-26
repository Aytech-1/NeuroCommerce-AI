<?php

declare(strict_types=1);

namespace App\Modules\CMS\Models;

use App\Core\Traits\Filterable;
use App\Core\Traits\HasUuid;
use App\Core\Traits\Sortable;
use App\Modules\Auth\Models\User;
use App\Modules\CMS\Database\Factories\BlogPostFactory;
use App\Shared\Enums\PageStatus;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Class BlogPost
 *
 * @property string $id
 * @property string $title
 * @property string $slug
 * @property string|null $content
 * @property string|null $excerpt
 * @property string|null $author_id
 * @property string|null $category
 * @property array|null $tags
 * @property string|null $featured_image
 * @property PageStatus $status
 * @property bool $is_featured
 * @property int $view_count
 * @property string|null $meta_title
 * @property string|null $meta_description
 * @property Carbon|null $published_at
 * @property Carbon $created_at
 * @property Carbon $updated_at
 * @property Carbon|null $deleted_at
 *
 * @package App\Modules\CMS\Models
 */
class BlogPost extends Model
{
    use HasFactory, HasUuid, SoftDeletes, Filterable, Sortable;

    protected $table = 'cms_blog_posts';

    protected $fillable = [
        'title',
        'slug',
        'content',
        'excerpt',
        'author_id',
        'category',
        'tags',
        'featured_image',
        'status',
        'is_featured',
        'view_count',
        'meta_title',
        'meta_description',
        'published_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => PageStatus::class,
            'is_featured' => 'boolean',
            'view_count' => 'integer',
            'tags' => 'array',
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

    public function scopeFeatured(Builder $query): Builder
    {
        return $query->where('is_featured', true);
    }

    public function isPublished(): bool
    {
        return $this->status === PageStatus::PUBLISHED
            && ($this->published_at === null || $this->published_at->isPast());
    }

    protected static function newFactory(): BlogPostFactory
    {
        return BlogPostFactory::new();
    }
}
