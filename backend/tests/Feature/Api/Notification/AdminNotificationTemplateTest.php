<?php

declare(strict_types=1);

namespace Tests\Feature\Api\Notification;

use App\Modules\Auth\Models\User;
use App\Modules\Notification\Models\NotificationTemplate;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminNotificationTemplateTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->admin()->create();
    }

    public function test_admin_can_list_notification_templates(): void
    {
        Sanctum::actingAs($this->admin);

        NotificationTemplate::factory()->count(3)->create();

        $response = $this->getJson('/api/v1/admin/notifications/templates');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('meta.total', 3);
    }

    public function test_admin_can_create_notification_template(): void
    {
        Sanctum::actingAs($this->admin);

        $payload = [
            'name' => 'flash_sale_announcement',
            'channel' => 'email',
            'notification_type' => 'system_broadcast',
            'subject' => 'Exclusive 24-Hour Flash Sale!',
            'body_template' => 'Hello {{ customer_name }}, get 50% off select items today!',
            'variables' => ['customer_name'],
            'is_active' => true,
        ];

        $response = $this->postJson('/api/v1/admin/notifications/templates', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'flash_sale_announcement')
            ->assertJsonPath('data.channel', 'email');

        $this->assertDatabaseHas('notif_templates', [
            'name' => 'flash_sale_announcement',
        ]);
    }

    public function test_duplicate_template_name_is_rejected_with_409(): void
    {
        Sanctum::actingAs($this->admin);

        NotificationTemplate::factory()->create(['name' => 'unique_template_name']);

        $response = $this->postJson('/api/v1/admin/notifications/templates', [
            'name' => 'unique_template_name',
            'channel' => 'email',
            'notification_type' => 'system_broadcast',
            'body_template' => 'Some content',
        ]);

        $this->assertTrue(in_array($response->status(), [409, 422]));
    }

    public function test_admin_can_update_template(): void
    {
        Sanctum::actingAs($this->admin);

        $template = NotificationTemplate::factory()->create(['subject' => 'Old Subject']);

        $response = $this->putJson("/api/v1/admin/notifications/templates/{$template->id}", [
            'subject' => 'Updated Subject',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.subject', 'Updated Subject');

        $this->assertDatabaseHas('notif_templates', [
            'id' => $template->id,
            'subject' => 'Updated Subject',
        ]);
    }

    public function test_admin_can_delete_template(): void
    {
        Sanctum::actingAs($this->admin);

        $template = NotificationTemplate::factory()->create();

        $response = $this->deleteJson("/api/v1/admin/notifications/templates/{$template->id}");

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertDatabaseMissing('notif_templates', ['id' => $template->id]);
    }
}
