<?php

declare(strict_types=1);

namespace Tests\Feature\Api\Admin;

use App\Modules\Auth\Models\User;
use App\Modules\Notification\Models\Notification;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminNotificationTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
        $this->admin = User::factory()->admin()->create();
        $this->admin->givePermissionTo('notification.view');
    }

    public function test_admin_can_list_notifications_and_fetch_unread_count(): void
    {
        Notification::create([
            'user_id' => $this->admin->id,
            'type' => 'stock_alert',
            'channel' => 'database',
            'title' => 'Low Stock Warning',
            'body' => 'Product SKU WBH-001 is below threshold.',
        ]);

        Sanctum::actingAs($this->admin, ['*']);

        $response = $this->getJson('/api/v1/admin/notifications');
        $response->assertStatus(200)->assertJsonPath('success', true);

        $unreadResponse = $this->getJson('/api/v1/admin/notifications/unread-count');
        $unreadResponse->assertStatus(200)->assertJsonPath('data.unread_count', 1);
    }

    public function test_admin_can_mark_notification_as_read_and_mark_all_read(): void
    {
        $notif = Notification::create([
            'user_id' => $this->admin->id,
            'type' => 'order_alert',
            'channel' => 'database',
            'title' => 'High Value Order',
            'body' => 'Order #ORD-100 placed.',
        ]);

        Sanctum::actingAs($this->admin, ['*']);

        $readResponse = $this->patchJson("/api/v1/admin/notifications/{$notif->id}/read");
        $readResponse->assertStatus(200);

        $markAllResponse = $this->postJson('/api/v1/admin/notifications/mark-all-read');
        $markAllResponse->assertStatus(200);
    }
}
