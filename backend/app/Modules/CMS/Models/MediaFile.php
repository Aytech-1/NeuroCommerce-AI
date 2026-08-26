<?php

declare(strict_types=1);

namespace App\Modules\CMS\Models;

use App\Core\Traits\Filterable;
use App\Core\Traits\HasUuid;
use App\Modules\Auth\Models\User;
use App\Modules\CMS\Database\Factories\MediaFileFactory;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Class MediaFile
 *
 * @property string $id
 * @property string $filename
 * @property string $original_filename
 * @property string $mime_type
 * @property int $file_size
 * @property string $disk
 * @property string $path
 * @property string $url
 * @property string|null $alt_text
 * @property string|null $collection
 * @property string|null $uploaded_by
 * @property Carbon $created_at
 * @property Carbon $updated_at
 *
 * @package App\Modules\CMS\Models
 */
class MediaFile extends Model
{
    use HasFactory, HasUuid, Filterable;

    protected $table = 'media_files';

    protected $fillable = [
        'filename',
        'original_filename',
        'mime_type',
        'file_size',
        'disk',
        'path',
        'url',
        'alt_text',
        'collection',
        'uploaded_by',
    ];

    protected function casts(): array
    {
        return [
            'file_size' => 'integer',
        ];
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    protected static function newFactory(): MediaFileFactory
    {
        return MediaFileFactory::new();
    }
}
