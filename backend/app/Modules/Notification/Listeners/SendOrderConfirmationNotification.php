<?php

declare(strict_types=1);

namespace App\Modules\Notification\Listeners;

use App\Modules\Notification\DTOs\SendNotificationDTO;
use App\Modules\Notification\Enums\NotificationChannel;
use App\Modules\Notification\Enums\NotificationType;
use App\Modules\Notification\Services\NotificationService;
use App\Modules\Order\Events\OrderPlaced;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;

/**
 * Class SendOrderConfirmationNotification
 *
 * @package App\Modules\Notification\Listeners
 */
class SendOrderConfirmationNotification implements ShouldQueue
{
    public string $queue = 'notifications';

    public function __construct(
        protected readonly NotificationService $notificationService
    ) {
    }

    public function handle(OrderPlaced $event): void
    {
        $order = $event->order;

        if (empty($order->user_id)) {
            Log::info("[SendOrderConfirmationNotification] Guest checkout order {$order->order_number} — skipping in-app notification.");
            return;
        }

        $user = $order->user;
        $recipientEmail = $user?->email ?: $order->guest_email;

        $dto = new SendNotificationDTO(
            userId: (string) $order->user_id,
            type: NotificationType::ORDER_CONFIRMATION,
            channel: NotificationChannel::EMAIL,
            title: "Order Confirmation - #{$order->order_number}",
            body: "Thank you for your order #{$order->order_number}. We are processing your items.",
            data: [
                'order_number' => $order->order_number,
                'customer_name' => $user ? $user->full_name : 'Valued Customer',
                'grand_total' => (string) $order->grand_total,
                'currency' => $order->currency_code,
            ],
            recipientEmail: $recipientEmail,
            subject: "Your NeuroCommerce AI Order Confirmation - #{$order->order_number}",
            isTransactional: true
        );

        $this->notificationService->send($dto);
    }
}
