<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Jobs;

use App\Modules\Catalog\Models\Product;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

/**
 * Class SyncProductSearchIndexJob
 *
 * @package App\Modules\Catalog\Jobs
 */
class SyncProductSearchIndexJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public string $productId, public string $action = 'index')
    {
    }

    public function handle(): void
    {
        $product = Product::find($this->productId);
        if (!$product && $this->action !== 'delete') {
            return;
        }

        Log::info("Search index sync processed for product: {$this->productId}, action: {$this->action}");
    }
}
