<?php

declare(strict_types=1);

namespace Tests\Feature\Api\Review;

use App\Modules\Auth\Models\User;
use App\Modules\Catalog\Models\Product;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReviewDuplicatePreventionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_customer_cannot_submit_duplicate_review_for_same_product(): void
    {
        $customer = User::factory()->customer()->create();
        $product = Product::factory()->create();

        // First review
        $res1 = $this->actingAs($customer, 'sanctum')->postJson("/api/v1/products/{$product->id}/reviews", [
            'rating' => 5,
            'title' => 'First Review',
        ]);
        $res1->assertStatus(201);

        // Second review attempt
        $res2 = $this->actingAs($customer, 'sanctum')->postJson("/api/v1/products/{$product->id}/reviews", [
            'rating' => 4,
            'title' => 'Duplicate Attempt',
        ]);

        $res2->assertStatus(409)
            ->assertJsonPath('code', 'DUPLICATE_REVIEW');

        $this->assertEquals(1, \App\Modules\Review\Models\Review::where('user_id', $customer->id)->count());
    }

    public function test_customer_can_review_different_products(): void
    {
        $customer = User::factory()->customer()->create();
        $product1 = Product::factory()->create();
        $product2 = Product::factory()->create();

        $res1 = $this->actingAs($customer, 'sanctum')->postJson("/api/v1/products/{$product1->id}/reviews", [
            'rating' => 5,
            'title' => 'Review for Product 1',
        ]);
        $res1->assertStatus(201);

        $res2 = $this->actingAs($customer, 'sanctum')->postJson("/api/v1/products/{$product2->id}/reviews", [
            'rating' => 4,
            'title' => 'Review for Product 2',
        ]);
        $res2->assertStatus(201);

        $this->assertEquals(2, \App\Modules\Review\Models\Review::where('user_id', $customer->id)->count());
    }
}
