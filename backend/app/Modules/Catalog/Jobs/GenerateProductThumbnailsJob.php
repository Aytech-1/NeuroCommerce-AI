<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Jobs;

use App\Modules\Catalog\Models\ProductImage;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

/**
 * Class GenerateProductThumbnailsJob
 *
 * @package App\Modules\Catalog\Jobs
 */
class GenerateProductThumbnailsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public string $productImageId)
    {
    }

    public function handle(): void
    {
        $image = ProductImage::find($this->productImageId);
        if (!$image) {
            return;
        }

        Log::info("Thumbnail generation job processed for image ID: {$this->productImageId}");
    }
}
