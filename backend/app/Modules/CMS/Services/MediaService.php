<?php

declare(strict_types=1);

namespace App\Modules\CMS\Services;

use App\Core\Abstracts\AbstractService;
use App\Core\Exceptions\EntityNotFoundException;
use App\Modules\CMS\Contracts\MediaFileRepositoryInterface;
use App\Modules\CMS\Models\MediaFile;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Class MediaService
 *
 * @package App\Modules\CMS\Services
 */
class MediaService extends AbstractService
{
    public function __construct(
        protected readonly MediaFileRepositoryInterface $mediaFileRepository
    ) {
    }

    public function paginateFiles(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        return $this->mediaFileRepository->paginateFiles($filters, $perPage);
    }

    public function getById(string $id): MediaFile
    {
        /** @var MediaFile|null $file */
        $file = $this->mediaFileRepository->findById($id);

        if (!$file) {
            throw new EntityNotFoundException('MediaFile', $id);
        }

        return $file;
    }

    public function uploadFile(UploadedFile $file, ?string $altText = null, ?string $collection = 'general', ?string $uploadedBy = null): MediaFile
    {
        $disk = config('filesystems.default', 'public');
        $originalFilename = $file->getClientOriginalName();
        $extension = strtolower((string) $file->getClientOriginalExtension());
        $filename = Str::uuid()->toString() . '.' . $extension;
        $folder = 'media/' . ($collection ?: 'general');
        $targetPath = $folder . '/' . $filename;

        // Harden SVG files against stored XSS by sanitizing scripts and active handlers
        if ($extension === 'svg' || str_contains((string) $file->getClientMimeType(), 'svg')) {
            $content = (string) file_get_contents($file->getRealPath());
            $sanitizedSvg = $this->sanitizeSvg($content);
            Storage::disk($disk)->put($targetPath, $sanitizedSvg);
            $path = $targetPath;
            $fileSize = strlen($sanitizedSvg);
        } else {
            $path = $file->storeAs($folder, $filename, $disk);
            $fileSize = $file->getSize();
        }

        $url = Storage::disk($disk)->url($path);

        $data = [
            'filename' => $filename,
            'original_filename' => $originalFilename,
            'mime_type' => $file->getClientMimeType() ?: 'application/octet-stream',
            'file_size' => $fileSize,
            'disk' => $disk,
            'path' => $path,
            'url' => $url,
            'alt_text' => $altText,
            'collection' => $collection,
            'uploaded_by' => $uploadedBy,
        ];

        /** @var MediaFile $mediaFile */
        $mediaFile = $this->mediaFileRepository->create($data);

        return $mediaFile;
    }

    public function deleteFile(string $id): bool
    {
        $file = $this->getById($id);

        if (Storage::disk($file->disk)->exists($file->path)) {
            Storage::disk($file->disk)->delete($file->path);
        }

        return $this->mediaFileRepository->delete($id);
    }

    /**
     * Sanitize SVG markup to prevent stored XSS attacks.
     */
    protected function sanitizeSvg(string $svg): string
    {
        // Strip script tags
        $svg = (string) preg_replace('/<script\b[^>]*>(.*?)<\/script>/is', '', $svg);
        // Strip inline JS event handlers (onload, onclick, onerror, etc.)
        $svg = (string) preg_replace('/(?:\s|^)on\w+\s*=\s*(?:["\'][^"\']*["\']|[^\s>]+)/i', '', $svg);
        // Strip javascript: pseudo-protocols
        $svg = (string) preg_replace('/href\s*=\s*["\']\s*javascript:[^"\']*["\']/i', '', $svg);
        $svg = (string) preg_replace('/xlink:href\s*=\s*["\']\s*javascript:[^"\']*["\']/i', '', $svg);

        return $svg;
    }
}
