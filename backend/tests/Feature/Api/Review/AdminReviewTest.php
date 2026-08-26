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

class AdminReviewTest extends TestCase
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

    public function test_admin_can_list_reviews_with_filters(): void
    {
        Sanctum::actingAs($this->admin);

        $customer = User::factory()->customer()->create();
        $product = Product::factory()->create();

        Review::factory()->create([
            'user_id' => $customer->id,
            'product_id' => $product->id,
            'rating' => 5,
            'is_approved' => false,
        ]);

        $response = $this->getJson('/api/v1/admin/reviews?is_approved=0&rating=5');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.rating', 5)
            ->assertJsonPath('data.0.is_approved', false);
    }

    public function test_admin_can_delete_review(): void
    {
        Sanctum::actingAs($this->admin);

        $customer = User::factory()->customer()->create();
        $product = Product::factory()->create();

        $review = Review::factory()->create([
            'user_id' => $customer->id,
            'product_id' => $product->id,
        ]);

        $response = $this->deleteJson("/api/v1/admin/reviews/{$review->id}");

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertSoftDeleted('reviews', [
            'id' => $review->id,
        ]);
    }
}
