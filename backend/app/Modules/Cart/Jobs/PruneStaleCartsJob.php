<?php

declare(strict_types=1);

namespace App\Modules\Cart\Jobs;

use App\Modules\Cart\Contracts\CartRepositoryInterface;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

/**
 * PruneStaleCartsJob
 *
 * Cleans up expired guest shopping carts beyond their TTL.
 */
class PruneStaleCartsJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public int $tries = 3;
    public int $timeout = 120;

    public function handle(CartRepositoryInterface $cartRepository): void
    {
        $deleted = $cartRepository->deleteExpired(now());

        Log::info('PruneStaleCartsJob: Deleted expired guest carts.', [
            'count' => $deleted,
            'timestamp' => now()->toIso8601String(),
        ]);
    }
}
