<?php

declare(strict_types=1);

namespace Tests\Feature\Api\Notification;

use App\Modules\Auth\Models\User;
use App\Modules\Notification\DTOs\SendNotificationDTO;
use App\Modules\Notification\Enums\NotificationChannel;
use App\Modules\Notification\Enums\NotificationType;
use App\Modules\Notification\Models\NotificationPreference;
use App\Modules\Notification\Services\NotificationPreferenceService;
use App\Modules\Notification\Services\NotificationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class NotificationPreferencesTest extends TestCase
{
    use RefreshDatabase;

    private User $customer;

    protected function setUp(): void
    {
        parent::setUp();
        $this->customer = User::factory()->customer()->create();
    }

    public function test_customer_can_retrieve_their_preferences(): void
    {
        Sanctum::actingAs($this->customer);

        NotificationPreference::factory()->create([
            'user_id' => $this->customer->id,
            'channel' => NotificationChannel::EMAIL,
            'notification_type' => NotificationType::ABANDONED_CART->value,
            'is_enabled' => true,
        ]);

        $response = $this->getJson('/api/v1/notifications/preferences');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonCount(1, 'data');
    }

    public function test_customer_can_update_notification_preferences(): void
    {
        Sanctum::actingAs($this->customer);

        $payload = [
            'preferences' => [
                [
                    'channel' => 'email',
                    'notification_type' => 'abandoned_cart',
                    'is_enabled' => false,
                ],
                [
                    'channel' => 'sms',
                    'notification_type' => 'review_approved',
                    'is_enabled' => true,
                ],
            ],
        ];

        $response = $this->putJson('/api/v1/notifications/preferences', $payload);

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('notif_preferences', [
            'user_id' => $this->customer->id,
            'channel' => 'email',
            'notification_type' => 'abandoned_cart',
            'is_enabled' => false,
        ]);

        $this->assertDatabaseHas('notif_preferences', [
            'user_id' => $this->customer->id,
            'channel' => 'sms',
            'notification_type' => 'review_approved',
            'is_enabled' => true,
        ]);
    }

    public function test_transactional_notifications_bypass_preference_suppression(): void
    {
        $preferenceService = app(NotificationPreferenceService::class);

        // Explicitly disable email order_confirmation in database
        NotificationPreference::create([
            'user_id' => $this->customer->id,
            'channel' => NotificationChannel::EMAIL,
            'notification_type' => NotificationType::ORDER_CONFIRMATION->value,
            'is_enabled' => false,
        ]);

        // Transactional notification check must still return true
        $allowed = $preferenceService->isNotificationAllowed(
            $this->customer->id,
            NotificationChannel::EMAIL->value,
            NotificationType::ORDER_CONFIRMATION->value
        );

        $this->assertTrue($allowed);
    }
}
