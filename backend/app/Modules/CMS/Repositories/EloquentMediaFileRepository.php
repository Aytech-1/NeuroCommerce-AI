<?php

declare(strict_types=1);

namespace App\Modules\CMS\Repositories;

use App\Core\Abstracts\AbstractRepository;
use App\Modules\CMS\Contracts\MediaFileRepositoryInterface;
use App\Modules\CMS\Models\MediaFile;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * Class EloquentMediaFileRepository
 *
 * @package App\Modules\CMS\Repositories
 */
class EloquentMediaFileRepository extends AbstractRepository implements MediaFileRepositoryInterface
{
    public function __construct(MediaFile $model)
    {
        parent::__construct($model);
    }

    public function paginateFiles(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        $query = $this->model->newQuery()->with('uploader');

        if (!empty($filters['collection'])) {
            $query->where('collection', $filters['collection']);
        }

        if (!empty($filters['mime_type'])) {
            $query->where('mime_type', 'like', $filters['mime_type'] . '%');
        }

        if (!empty($filters['search'])) {
            $search = '%' . $filters['search'] . '%';
            $query->where(function ($q) use ($search) {
                $q->where('filename', 'like', $search)
                    ->orWhere('original_filename', 'like', $search)
                    ->orWhere('alt_text', 'like', $search);
            });
        }

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }
}
