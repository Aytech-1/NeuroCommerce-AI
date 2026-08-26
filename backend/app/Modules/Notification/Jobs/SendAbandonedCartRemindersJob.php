<?php

declare(strict_types=1);

namespace App\Modules\Notification\Jobs;

use App\Modules\Cart\Models\Cart;
use App\Modules\Notification\DTOs\SendNotificationDTO;
use App\Modules\Notification\Enums\NotificationChannel;
use App\Modules\Notification\Enums\NotificationType;
use App\Modules\Notification\Services\NotificationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

/**
 * Class SendAbandonedCartRemindersJob
 *
 * @package App\Modules\Notification\Jobs
 */
class SendAbandonedCartRemindersJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public function handle(NotificationService $notificationService): void
    {
        Log::info('[SendAbandonedCartRemindersJob] Checking for abandoned carts...');

        // Find carts updated between 4 hours and 24 hours ago that have items and a user
        $cutoff = now()->subHours(4);
        $expiredLimit = now()->subHours(24);

        $abandonedCarts = Cart::with(['user', 'items'])
            ->whereNotNull('user_id')
            ->where('updated_at', '<=', $cutoff)
            ->where('updated_at', '>=', $expiredLimit)
            ->whereHas('items')
            ->get();

        foreach ($abandonedCarts as $cart) {
            if (!$cart->user) {
                continue;
            }

            $itemCount = $cart->items->sum('quantity');

            $dto = new SendNotificationDTO(
                userId: (string) $cart->user_id,
                type: NotificationType::ABANDONED_CART,
                channel: NotificationChannel::EMAIL,
                title: 'You left items in your cart!',
                body: "You have {$itemCount} items waiting in your shopping cart. Complete your checkout today!",
                data: [
                    'customer_name' => $cart->user->full_name,
                    'item_count' => $itemCount,
                    'cart_url' => url('/cart'),
                ],
                recipientEmail: $cart->user->email,
                subject: 'Complete your purchase — your cart is waiting!',
                isTransactional: false
            );

            $notificationService->send($dto);
        }
    }
}
