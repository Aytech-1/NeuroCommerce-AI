<?php

declare(strict_types=1);

namespace App\Modules\Notification\Listeners;

use App\Modules\Notification\DTOs\SendNotificationDTO;
use App\Modules\Notification\Enums\NotificationChannel;
use App\Modules\Notification\Enums\NotificationType;
use App\Modules\Notification\Services\NotificationService;
use App\Modules\Review\Events\ReviewApproved;
use Illuminate\Contracts\Queue\ShouldQueue;

/**
 * Class SendReviewApprovedNotification
 *
 * @package App\Modules\Notification\Listeners
 */
class SendReviewApprovedNotification implements ShouldQueue
{
    public string $queue = 'notifications';

    public function __construct(
        protected readonly NotificationService $notificationService
    ) {
    }

    public function handle(ReviewApproved $event): void
    {
        $review = $event->review;

        if (empty($review->user_id)) {
            return;
        }

        $user = $review->user;
        $product = $review->product;

        $dto = new SendNotificationDTO(
            userId: (string) $review->user_id,
            type: NotificationType::REVIEW_APPROVED,
            channel: NotificationChannel::DATABASE,
            title: "Your review for {$product?->name} is now live!",
            body: "Your {$review->rating}-star review for {$product?->name} has been approved and published.",
            data: [
                'product_id' => $review->product_id,
                'product_name' => $product?->name,
                'rating' => $review->rating,
            ],
            recipientEmail: $user?->email,
            isTransactional: false
        );

        $this->notificationService->send($dto);
    }
}
