<?php

declare(strict_types=1);

namespace Tests\Feature\Api\Notification;

use App\Modules\Auth\Models\User;
use App\Modules\Notification\Models\Notification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class NotificationBroadcastTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $customer1;
    private User $customer2;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->admin()->create();
        $this->customer1 = User::factory()->customer()->create();
        $this->customer2 = User::factory()->customer()->create();
    }

    public function test_admin_can_broadcast_notification_to_target_users(): void
    {
        Sanctum::actingAs($this->admin);

        $payload = [
            'title' => 'Scheduled System Maintenance',
            'body' => 'Platform maintenance will occur tonight between 02:00 and 04:00 UTC.',
            'channel' => 'database',
            'target_user_ids' => [
                $this->customer1->id,
                $this->customer2->id,
            ],
        ];

        $response = $this->postJson('/api/v1/admin/notifications/send', $payload);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.dispatched_count', 2);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $this->customer1->id,
            'title' => 'Scheduled System Maintenance',
        ]);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $this->customer2->id,
            'title' => 'Scheduled System Maintenance',
        ]);
    }

    public function test_customer_cannot_broadcast_notifications_forbidden(): void
    {
        Sanctum::actingAs($this->customer1);

        $payload = [
            'title' => 'Malicious Broadcast',
            'body' => 'Unauthorized broadcast attempt.',
        ];

        $response = $this->postJson('/api/v1/admin/notifications/send', $payload);

        $response->assertStatus(403);
    }
}
