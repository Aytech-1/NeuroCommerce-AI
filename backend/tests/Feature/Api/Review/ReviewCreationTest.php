<?php

declare(strict_types=1);

namespace Tests\Feature\Api\Review;

use App\Modules\Auth\Models\User;
use App\Modules\Catalog\Models\Product;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReviewCreationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_authenticated_user_can_submit_review(): void
    {
        $customer = User::factory()->customer()->create();
        $product = Product::factory()->create();

        $response = $this->actingAs($customer, 'sanctum')->postJson("/api/v1/products/{$product->id}/reviews", [
            'rating' => 5,
            'title' => 'Incredible product quality!',
            'body' => 'Really exceeded my expectations for the price point.',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.rating', 5)
            ->assertJsonPath('data.title', 'Incredible product quality!')
            ->assertJsonPath('data.is_approved', false);

        $this->assertDatabaseHas('reviews', [
            'product_id' => $product->id,
            'user_id' => $customer->id,
            'rating' => 5,
            'is_approved' => false,
        ]);
    }

    public function test_unauthenticated_user_cannot_submit_review(): void
    {
        $product = Product::factory()->create();

        $response = $this->postJson("/api/v1/products/{$product->id}/reviews", [
            'rating' => 4,
            'title' => 'Guest attempt',
        ]);

        $response->assertStatus(401);
    }

    public function test_invalid_rating_values_are_rejected(): void
    {
        $customer = User::factory()->customer()->create();
        $product = Product::factory()->create();

        $resLow = $this->actingAs($customer, 'sanctum')->postJson("/api/v1/products/{$product->id}/reviews", [
            'rating' => 0,
            'title' => 'Zero rating',
        ]);
        $resLow->assertStatus(422)->assertJsonValidationErrors(['rating']);

        $resHigh = $this->actingAs($customer, 'sanctum')->postJson("/api/v1/products/{$product->id}/reviews", [
            'rating' => 6,
            'title' => 'Six rating',
        ]);
        $resHigh->assertStatus(422)->assertJsonValidationErrors(['rating']);
    }

    public function test_nonexistent_product_returns_404(): void
    {
        $customer = User::factory()->customer()->create();
        $fakeId = '01912a4c-0000-7000-8000-000000000099';

        $response = $this->actingAs($customer, 'sanctum')->postJson("/api/v1/products/{$fakeId}/reviews", [
            'rating' => 5,
            'title' => 'Missing product',
        ]);

        $response->assertStatus(404);
    }

    public function test_review_content_sanitizes_html_tags(): void
    {
        $customer = User::factory()->customer()->create();
        $product = Product::factory()->create();

        $response = $this->actingAs($customer, 'sanctum')->postJson("/api/v1/products/{$product->id}/reviews", [
            'rating' => 5,
            'title' => '<script>alert("xss")</script>Clean Title',
            'body' => '<p>Paragraph text</p><b>Bold text</b>',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.title', 'alert("xss")Clean Title')
            ->assertJsonPath('data.body', 'Paragraph textBold text');
    }
}
