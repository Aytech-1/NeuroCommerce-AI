<?php

declare(strict_types=1);

namespace App\Modules\Notification\Listeners;

use App\Modules\Auth\Events\UserRegistered;
use App\Modules\Notification\DTOs\SendNotificationDTO;
use App\Modules\Notification\Enums\NotificationChannel;
use App\Modules\Notification\Enums\NotificationType;
use App\Modules\Notification\Services\NotificationService;
use Illuminate\Contracts\Queue\ShouldQueue;

/**
 * Class SendWelcomeNotification
 *
 * @package App\Modules\Notification\Listeners
 */
class SendWelcomeNotification implements ShouldQueue
{
    public string $queue = 'notifications';

    public function __construct(
        protected readonly NotificationService $notificationService
    ) {
    }

    public function handle(UserRegistered $event): void
    {
        $user = $event->user;

        $dto = new SendNotificationDTO(
            userId: (string) $user->id,
            type: NotificationType::USER_REGISTERED,
            channel: NotificationChannel::EMAIL,
            title: "Welcome to NeuroCommerce AI!",
            body: "Welcome, {$user->full_name}! We're thrilled to have you with us.",
            data: [
                'customer_name' => $user->full_name,
                'email' => $user->email,
            ],
            recipientEmail: $user->email,
            subject: "Welcome to NeuroCommerce AI, {$user->first_name}!",
            isTransactional: true
        );

        $this->notificationService->send($dto);
    }
}
