<?php

declare(strict_types=1);

namespace App\Modules\Coupon\Jobs;

use App\Modules\Coupon\Models\Coupon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

/**
 * Class DeactivateExpiredCouponsJob
 *
 * Scans coupons that have expired or reached usage limits and deactivates them.
 *
 * @package App\Modules\Coupon\Jobs
 */
class DeactivateExpiredCouponsJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public function handle(): void
    {
        $now = now();

        $affectedExpired = Coupon::where('is_active', true)
            ->whereNotNull('expires_at')
            ->where('expires_at', '<', $now)
            ->update(['is_active' => false]);

        $affectedUsage = Coupon::where('is_active', true)
            ->whereNotNull('usage_limit')
            ->whereColumn('times_used', '>=', 'usage_limit')
            ->update(['is_active' => false]);

        Log::info('DeactivateExpiredCouponsJob completed', [
            'expired_deactivated' => $affectedExpired,
            'limit_deactivated' => $affectedUsage,
        ]);
    }
}
