<?php

declare(strict_types=1);

namespace Tests\Feature\Api\Notification;

use App\Modules\Auth\Models\User;
use App\Modules\Notification\Enums\DeliveryStatus;
use App\Modules\Notification\Models\Notification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CustomerNotificationTest extends TestCase
{
    use RefreshDatabase;

    private User $customer;
    private User $otherCustomer;

    protected function setUp(): void
    {
        parent::setUp();
        $this->customer = User::factory()->customer()->create();
        $this->otherCustomer = User::factory()->customer()->create();
    }

    public function test_customer_can_list_their_notifications_paginated(): void
    {
        Sanctum::actingAs($this->customer);

        Notification::factory()->count(3)->create(['user_id' => $this->customer->id]);
        Notification::factory()->count(2)->create(['user_id' => $this->otherCustomer->id]);

        $response = $this->getJson('/api/v1/notifications');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonCount(3, 'data')
            ->assertJsonPath('meta.total', 3);
    }

    public function test_customer_can_filter_unread_notifications(): void
    {
        Sanctum::actingAs($this->customer);

        Notification::factory()->count(2)->unread()->create(['user_id' => $this->customer->id]);
        Notification::factory()->count(3)->read()->create(['user_id' => $this->customer->id]);

        $response = $this->getJson('/api/v1/notifications?unread_only=1');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonCount(2, 'data');
    }

    public function test_customer_can_get_unread_notification_count(): void
    {
        Sanctum::actingAs($this->customer);

        Notification::factory()->count(4)->unread()->create(['user_id' => $this->customer->id]);
        Notification::factory()->count(2)->read()->create(['user_id' => $this->customer->id]);

        $response = $this->getJson('/api/v1/notifications/unread-count');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.unread_count', 4);
    }

    public function test_customer_can_mark_single_notification_as_read(): void
    {
        Sanctum::actingAs($this->customer);

        $notification = Notification::factory()->unread()->create(['user_id' => $this->customer->id]);

        $response = $this->patchJson("/api/v1/notifications/{$notification->id}/read");

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('notifications', [
            'id' => $notification->id,
            'status' => DeliveryStatus::READ->value,
        ]);
        $this->assertNotNull($notification->fresh()->read_at);
    }

    public function test_customer_can_mark_all_notifications_as_read(): void
    {
        Sanctum::actingAs($this->customer);

        Notification::factory()->count(3)->unread()->create(['user_id' => $this->customer->id]);

        $response = $this->postJson('/api/v1/notifications/mark-all-read');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.updated_count', 3);

        $this->assertEquals(0, Notification::where('user_id', $this->customer->id)->unread()->count());
    }

    public function test_customer_can_delete_notification(): void
    {
        Sanctum::actingAs($this->customer);

        $notification = Notification::factory()->create(['user_id' => $this->customer->id]);

        $response = $this->deleteJson("/api/v1/notifications/{$notification->id}");

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertDatabaseMissing('notifications', ['id' => $notification->id]);
    }

    public function test_customer_cannot_mark_another_customers_notification_as_read_idor_defense(): void
    {
        Sanctum::actingAs($this->customer);

        $otherNotification = Notification::factory()->unread()->create(['user_id' => $this->otherCustomer->id]);

        $response = $this->patchJson("/api/v1/notifications/{$otherNotification->id}/read");

        $response->assertStatus(404);
        $this->assertNull($otherNotification->fresh()->read_at);
    }

    public function test_unauthenticated_request_returns_401(): void
    {
        $this->getJson('/api/v1/notifications')->assertStatus(401);
        $this->getJson('/api/v1/notifications/unread-count')->assertStatus(401);
    }
}
