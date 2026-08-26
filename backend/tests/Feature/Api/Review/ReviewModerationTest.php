<?php

declare(strict_types=1);

namespace Tests\Feature\Api\Review;

use App\Modules\Auth\Models\Role;
use App\Modules\Auth\Models\User;
use App\Modules\Catalog\Models\Product;
use App\Modules\Review\Models\Review;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ReviewModerationTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);

        $this->admin = User::where('email', 'admin@neurocommerce.test')->first() ?? User::factory()->admin()->create();
        $adminRole = Role::findByName('admin', 'api');
        $this->admin->assignRole($adminRole);
        $this->admin->givePermissionTo('review.view', 'review.moderate', 'review.delete');
    }

    public function test_admin_can_approve_pending_review(): void
    {
        Sanctum::actingAs($this->admin);

        $customer = User::factory()->customer()->create();
        $product = Product::factory()->create();

        $review = Review::factory()->create([
            'user_id' => $customer->id,
            'product_id' => $product->id,
            'is_approved' => false,
        ]);

        $response = $this->patchJson("/api/v1/admin/reviews/{$review->id}/approve");

        $response->assertStatus(200)
            ->assertJsonPath('data.is_approved', true);

        $this->assertDatabaseHas('reviews', [
            'id' => $review->id,
            'is_approved' => true,
        ]);
    }

    public function test_admin_can_reject_review(): void
    {
        Sanctum::actingAs($this->admin);

        $customer = User::factory()->customer()->create();
        $product = Product::factory()->create();

        $review = Review::factory()->approved()->create([
            'user_id' => $customer->id,
            'product_id' => $product->id,
        ]);

        $response = $this->patchJson("/api/v1/admin/reviews/{$review->id}/reject");

        $response->assertStatus(200)
            ->assertJsonPath('data.is_approved', false);

        $this->assertDatabaseHas('reviews', [
            'id' => $review->id,
            'is_approved' => false,
        ]);
    }

    public function test_admin_can_toggle_featured_review(): void
    {
        Sanctum::actingAs($this->admin);

        $customer = User::factory()->customer()->create();
        $product = Product::factory()->create();

        $review = Review::factory()->approved()->create([
            'user_id' => $customer->id,
            'product_id' => $product->id,
            'is_featured' => false,
        ]);

        $response = $this->patchJson("/api/v1/admin/reviews/{$review->id}/feature");

        $response->assertStatus(200)
            ->assertJsonPath('data.is_featured', true);
    }

    public function test_admin_can_reply_to_review(): void
    {
        Sanctum::actingAs($this->admin);

        $customer = User::factory()->customer()->create();
        $product = Product::factory()->create();

        $review = Review::factory()->approved()->create([
            'user_id' => $customer->id,
            'product_id' => $product->id,
        ]);

        $response = $this->postJson("/api/v1/admin/reviews/{$review->id}/reply", [
            'admin_reply' => 'Thank you for your valuable feedback! We are thrilled you liked the product.',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.admin_reply', 'Thank you for your valuable feedback! We are thrilled you liked the product.')
            ->assertJsonPath('data.admin_reply_at', fn ($val) => $val !== null);
    }

    public function test_customer_cannot_moderate_reviews(): void
    {
        $customer = User::factory()->customer()->create();
        $product = Product::factory()->create();

        $review = Review::factory()->create([
            'user_id' => $customer->id,
            'product_id' => $product->id,
            'is_approved' => false,
        ]);

        Sanctum::actingAs($customer);

        $resApprove = $this->patchJson("/api/v1/admin/reviews/{$review->id}/approve");
        $resApprove->assertStatus(403);

        $resReject = $this->patchJson("/api/v1/admin/reviews/{$review->id}/reject");
        $resReject->assertStatus(403);
    }
}
