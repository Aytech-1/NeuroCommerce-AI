<?php

declare(strict_types=1);

namespace Tests\Feature\Api\Notification;

use App\Modules\Auth\Models\User;
use App\Modules\Notification\DTOs\SendNotificationDTO;
use App\Modules\Notification\Enums\NotificationChannel;
use App\Modules\Notification\Enums\NotificationType;
use App\Modules\Notification\Jobs\DispatchNotificationJob;
use App\Modules\Notification\Services\NotificationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class QueuedNotificationDispatchTest extends TestCase
{
    use RefreshDatabase;

    public function test_notifications_dispatch_onto_notifications_queue(): void
    {
        Queue::fake();

        $user = User::factory()->customer()->create();
        $service = app(NotificationService::class);

        $dto = new SendNotificationDTO(
            userId: $user->id,
            type: NotificationType::SYSTEM_BROADCAST,
            channel: NotificationChannel::EMAIL,
            title: 'Test Notification',
            body: 'Test notification body',
            recipientEmail: $user->email,
            isTransactional: false
        );

        $service->send($dto);

        Queue::assertPushedOn('notifications', DispatchNotificationJob::class);
    }
}
