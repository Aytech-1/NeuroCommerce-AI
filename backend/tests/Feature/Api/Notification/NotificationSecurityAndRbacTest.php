<?php

declare(strict_types=1);

namespace Tests\Feature\Api\Notification;

use App\Modules\Auth\Models\User;
use App\Modules\Notification\Models\NotificationTemplate;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class NotificationSecurityAndRbacTest extends TestCase
{
    use RefreshDatabase;

    private User $customer;
    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->customer = User::factory()->customer()->create();
        $this->admin = User::factory()->admin()->create();
    }

    public function test_customer_cannot_access_admin_templates(): void
    {
        Sanctum::actingAs($this->customer);

        $this->getJson('/api/v1/admin/notifications/templates')->assertStatus(403);
        $this->postJson('/api/v1/admin/notifications/templates', [
            'name' => 'test',
            'channel' => 'email',
            'notification_type' => 'test',
            'body_template' => 'test',
        ])->assertStatus(403);
    }

    public function test_unauthenticated_cannot_access_admin_routes(): void
    {
        $this->getJson('/api/v1/admin/notifications/templates')->assertStatus(401);
        $this->postJson('/api/v1/admin/notifications/send', [
            'title' => 'Test',
            'body' => 'Test',
        ])->assertStatus(401);
    }
}
