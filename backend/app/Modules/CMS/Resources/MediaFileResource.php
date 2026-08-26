<?php

declare(strict_types=1);

namespace App\Modules\CMS\Resources;

use App\Modules\CMS\Models\MediaFile;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Class MediaFileResource
 *
 * @mixin MediaFile
 * @package App\Modules\CMS\Resources
 */
class MediaFileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'filename' => $this->filename,
            'original_filename' => $this->original_filename,
            'mime_type' => $this->mime_type,
            'file_size' => $this->file_size,
            'disk' => $this->disk,
            'url' => $this->url,
            'alt_text' => $this->alt_text,
            'collection' => $this->collection,
            'uploaded_by' => $this->whenLoaded('uploader', function () {
                return [
                    'id' => $this->uploader->id,
                    'name' => "{$this->uploader->first_name} {$this->uploader->last_name}",
                ];
            }),
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
        ];
    }
}
