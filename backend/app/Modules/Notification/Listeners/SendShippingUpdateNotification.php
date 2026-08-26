<?php

declare(strict_types=1);

namespace App\Modules\Notification\Listeners;

use App\Modules\Notification\DTOs\SendNotificationDTO;
use App\Modules\Notification\Enums\NotificationChannel;
use App\Modules\Notification\Enums\NotificationType;
use App\Modules\Notification\Services\NotificationService;
use App\Modules\Shipping\Events\ShipmentCreated;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;

/**
 * Class SendShippingUpdateNotification
 *
 * @package App\Modules\Notification\Listeners
 */
class SendShippingUpdateNotification implements ShouldQueue
{
    public string $queue = 'notifications';

    public function __construct(
        protected readonly NotificationService $notificationService
    ) {
    }

    public function handle(ShipmentCreated $event): void
    {
        $shipment = $event->shipment;
        $order = $shipment->order;

        if (!$order || empty($order->user_id)) {
            Log::info("[SendShippingUpdateNotification] Shipment {$shipment->tracking_number} has no associated user.");
            return;
        }

        $user = $order->user;

        $dto = new SendNotificationDTO(
            userId: (string) $order->user_id,
            type: NotificationType::ORDER_SHIPPED,
            channel: NotificationChannel::EMAIL,
            title: "Your Order #{$order->order_number} Has Shipped!",
            body: "Your shipment is on its way with carrier {$shipment->carrier}. Tracking number: {$shipment->tracking_number}",
            data: [
                'order_number' => $order->order_number,
                'customer_name' => $user ? $user->full_name : 'Customer',
                'carrier' => $shipment->carrier,
                'tracking_number' => $shipment->tracking_number,
                'tracking_url' => $shipment->tracking_url,
            ],
            recipientEmail: $user?->email,
            recipientPhone: $user?->phone,
            subject: "Your order #{$order->order_number} has been shipped!",
            isTransactional: true
        );

        $this->notificationService->send($dto);
    }
}
