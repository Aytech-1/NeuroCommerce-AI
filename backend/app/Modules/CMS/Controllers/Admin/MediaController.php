<?php

declare(strict_types=1);

namespace App\Modules\CMS\Controllers\Admin;

use App\Core\Helpers\PaginationHelper;
use App\Core\Helpers\ResponseHelper;
use App\Http\Controllers\Controller;
use App\Modules\CMS\Models\MediaFile;
use App\Modules\CMS\Requests\UploadMediaRequest;
use App\Modules\CMS\Resources\MediaFileResource;
use App\Modules\CMS\Services\MediaService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Class MediaController
 *
 * @package App\Modules\CMS\Controllers\Admin
 */
class MediaController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        protected readonly MediaService $mediaService
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', MediaFile::class);

        $perPage = PaginationHelper::getPerPage($request, 20);
        $filters = $request->only(['collection', 'mime_type', 'search']);
        $files = $this->mediaService->paginateFiles($filters, $perPage);

        return ResponseHelper::paginated($files, MediaFileResource::class);
    }

    public function store(UploadMediaRequest $request): JsonResponse
    {
        $this->authorize('create', MediaFile::class);

        $uploadedFile = $request->file('file');
        $altText = $request->input('alt_text');
        $collection = $request->input('collection', 'general');
        $userId = $request->user()?->id;

        $mediaFile = $this->mediaService->uploadFile($uploadedFile, $altText, $collection, $userId);

        return ResponseHelper::created(
            data: new MediaFileResource($mediaFile),
            message: 'File uploaded successfully.'
        );
    }

    public function show(string $id): JsonResponse
    {
        $file = $this->mediaService->getById($id);
        $this->authorize('view', $file);

        return ResponseHelper::success(
            data: new MediaFileResource($file),
            message: 'File retrieved successfully.'
        );
    }

    public function destroy(string $id): JsonResponse
    {
        $file = $this->mediaService->getById($id);
        $this->authorize('delete', $file);

        $this->mediaService->deleteFile($id);

        return ResponseHelper::success(
            data: null,
            message: 'File deleted successfully.'
        );
    }
}
