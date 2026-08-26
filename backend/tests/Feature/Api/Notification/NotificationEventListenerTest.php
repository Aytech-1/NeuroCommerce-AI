<?php

declare(strict_types=1);

namespace Tests\Feature\Api\Notification;

use App\Modules\Auth\Events\UserRegistered;
use App\Modules\Auth\Models\User;
use App\Modules\Catalog\Models\Product;
use App\Modules\Notification\Listeners\SendOrderConfirmationNotification;
use App\Modules\Notification\Listeners\SendReviewApprovedNotification;
use App\Modules\Notification\Listeners\SendWelcomeNotification;
use App\Modules\Notification\Services\NotificationService;
use App\Modules\Order\Events\OrderPlaced;
use App\Modules\Order\Models\Order;
use App\Modules\Review\Events\ReviewApproved;
use App\Modules\Review\Models\Review;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;

class NotificationEventListenerTest extends TestCase
{
    use RefreshDatabase;

    private User $customer;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
        $this->customer = User::factory()->customer()->create();
    }

    public function test_order_placed_listener_triggers_notification(): void
    {
        $order = Order::factory()->create([
            'user_id' => $this->customer->id,
            'order_number' => 'ORD-999888',
        ]);

        $listener = app(SendOrderConfirmationNotification::class);
        $event = new OrderPlaced($order);

        $listener->handle($event);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $this->customer->id,
            'type' => 'order_confirmation',
        ]);
    }

    public function test_user_registered_listener_triggers_welcome_notification(): void
    {
        $newUser = User::factory()->customer()->create([
            'email' => 'newuser@neurocommerce.ai',
        ]);

        $listener = app(SendWelcomeNotification::class);
        $event = new UserRegistered($newUser);

        $listener->handle($event);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $newUser->id,
            'type' => 'user_registered',
        ]);
    }

    public function test_review_approved_listener_triggers_notification(): void
    {
        $product = Product::factory()->create();

        $review = Review::factory()->create([
            'user_id' => $this->customer->id,
            'product_id' => $product->id,
            'rating' => 5,
        ]);

        $listener = app(SendReviewApprovedNotification::class);
        $event = new ReviewApproved($review);

        $listener->handle($event);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $this->customer->id,
            'type' => 'review_approved',
        ]);
    }
}
