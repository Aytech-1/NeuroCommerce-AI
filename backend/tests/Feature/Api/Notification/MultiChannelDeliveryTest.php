<?php

declare(strict_types=1);

namespace Tests\Feature\Api\Notification;

use App\Modules\Auth\Models\User;
use App\Modules\Notification\DTOs\SendNotificationDTO;
use App\Modules\Notification\Enums\NotificationChannel;
use App\Modules\Notification\Enums\NotificationType;
use App\Modules\Notification\Services\NotificationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class MultiChannelDeliveryTest extends TestCase
{
    use RefreshDatabase;

    private User $customer;

    protected function setUp(): void
    {
        parent::setUp();
        $this->customer = User::factory()->customer()->create([
            'email' => 'customer@neurocommerce.ai',
            'phone' => '+1234567890',
        ]);
    }

    public function test_email_delivery_dispatches_raw_mail(): void
    {
        $service = app(NotificationService::class);

        $dto = new SendNotificationDTO(
            userId: $this->customer->id,
            type: NotificationType::ORDER_CONFIRMATION,
            channel: NotificationChannel::EMAIL,
            title: 'Order Confirmed',
            body: 'Your order #1001 is placed.',
            recipientEmail: $this->customer->email,
            subject: 'Order Confirmation #1001',
            isTransactional: true
        );

        $delivered = $service->deliver($dto);

        $this->assertTrue($delivered);
    }

    public function test_sms_delivery_executes_successfully(): void
    {
        $service = app(NotificationService::class);

        $dto = new SendNotificationDTO(
            userId: $this->customer->id,
            type: NotificationType::ORDER_SHIPPED,
            channel: NotificationChannel::SMS,
            title: 'Order Shipped',
            body: 'Your package is out for delivery.',
            recipientPhone: $this->customer->phone,
            isTransactional: true
        );

        $delivered = $service->deliver($dto);

        $this->assertTrue($delivered);
    }

    public function test_database_notification_persists_record(): void
    {
        $service = app(NotificationService::class);

        $dto = new SendNotificationDTO(
            userId: $this->customer->id,
            type: NotificationType::SYSTEM_BROADCAST,
            channel: NotificationChannel::DATABASE,
            title: 'System Alert',
            body: 'Welcome to the new platform update.',
            isTransactional: false
        );

        $delivered = $service->deliver($dto);

        $this->assertTrue($delivered);
        $this->assertDatabaseHas('notifications', [
            'user_id' => $this->customer->id,
            'title' => 'System Alert',
            'channel' => 'database',
        ]);
    }
}
