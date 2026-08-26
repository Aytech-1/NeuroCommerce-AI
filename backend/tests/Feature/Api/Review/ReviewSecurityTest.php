<?php

declare(strict_types=1);

namespace Tests\Feature\Api\Review;

use App\Modules\Auth\Models\User;
use App\Modules\Catalog\Models\Product;
use App\Modules\Review\Models\Review;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReviewSecurityTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_customer_cannot_edit_another_customers_review(): void
    {
        $owner = User::factory()->customer()->create();
        $attacker = User::factory()->customer()->create();
        $product = Product::factory()->create();

        $review = Review::factory()->create([
            'user_id' => $owner->id,
            'product_id' => $product->id,
            'title' => 'Original Owner Title',
        ]);

        $response = $this->actingAs($attacker, 'sanctum')->putJson("/api/v1/customer/reviews/{$review->id}", [
            'title' => 'Hacked Title',
        ]);

        $response->assertStatus(403);

        $this->assertDatabaseHas('reviews', [
            'id' => $review->id,
            'title' => 'Original Owner Title',
        ]);
    }

    public function test_customer_cannot_delete_another_customers_review(): void
    {
        $owner = User::factory()->customer()->create();
        $attacker = User::factory()->customer()->create();
        $product = Product::factory()->create();

        $review = Review::factory()->create([
            'user_id' => $owner->id,
            'product_id' => $product->id,
        ]);

        $response = $this->actingAs($attacker, 'sanctum')->deleteJson("/api/v1/customer/reviews/{$review->id}");

        $response->assertStatus(403);

        $this->assertNotSoftDeleted('reviews', [
            'id' => $review->id,
        ]);
    }

    public function test_customer_cannot_access_admin_review_endpoints(): void
    {
        $customer = User::factory()->customer()->create();

        $response = $this->actingAs($customer, 'sanctum')->getJson('/api/v1/admin/reviews');

        $response->assertStatus(403);
    }

    public function test_unauthenticated_request_to_admin_reviews_returns_401(): void
    {
        $response = $this->getJson('/api/v1/admin/reviews');

        $response->assertStatus(401);
    }
}
