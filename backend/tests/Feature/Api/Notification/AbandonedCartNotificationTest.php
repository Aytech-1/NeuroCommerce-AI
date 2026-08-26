<?php

declare(strict_types=1);

namespace Tests\Feature\Api\Notification;

use App\Modules\Auth\Models\User;
use App\Modules\Cart\Models\Cart;
use App\Modules\Cart\Models\CartItem;
use App\Modules\Catalog\Models\Product;
use App\Modules\Notification\Jobs\SendAbandonedCartRemindersJob;
use App\Modules\Notification\Services\NotificationService;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AbandonedCartNotificationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_abandoned_cart_job_dispatches_notifications_for_inactive_carts(): void
    {
        $user = User::factory()->customer()->create();
        $product = Product::factory()->create();

        $cart = Cart::factory()->create([
            'user_id' => $user->id,
            'updated_at' => now()->subHours(5),
        ]);

        CartItem::create([
            'cart_id' => $cart->id,
            'product_id' => $product->id,
            'quantity' => 2,
            'unit_price' => 25.00,
        ]);

        $job = new SendAbandonedCartRemindersJob();
        $job->handle(app(NotificationService::class));

        $this->assertDatabaseHas('notifications', [
            'user_id' => $user->id,
            'type' => 'abandoned_cart',
        ]);
    }
}
