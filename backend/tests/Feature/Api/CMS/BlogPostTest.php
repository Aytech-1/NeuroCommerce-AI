<?php

declare(strict_types=1);

namespace Tests\Feature\Api\CMS;

use App\Modules\Auth\Models\User;
use App\Modules\CMS\Models\BlogPost;
use App\Shared\Enums\PageStatus;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BlogPostTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->admin()->create();
    }

    public function test_public_user_can_list_published_blog_posts(): void
    {
        BlogPost::factory()->count(3)->published()->create();
        BlogPost::factory()->count(2)->draft()->create();

        $response = $this->getJson('/api/v1/cms/blog');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonCount(3, 'data');
    }

    public function test_public_user_can_view_published_blog_post_by_slug(): void
    {
        $post = BlogPost::factory()->published()->create([
            'title' => 'The Future of AI Commerce',
            'slug' => 'the-future-of-ai-commerce',
            'view_count' => 10,
        ]);

        $response = $this->getJson('/api/v1/cms/blog/the-future-of-ai-commerce');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.slug', 'the-future-of-ai-commerce');

        $this->assertDatabaseHas('cms_blog_posts', [
            'id' => $post->id,
            'view_count' => 11,
        ]);
    }

    public function test_admin_can_crud_blog_post(): void
    {
        // 1. Create
        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/admin/blog', [
                'title' => 'Top 10 E-commerce Strategies',
                'content' => '<p>Strategic guide for modern retailers.</p>',
                'category' => 'Strategy',
                'tags' => ['retail', 'tips'],
                'is_featured' => true,
                'status' => 'published',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.title', 'Top 10 E-commerce Strategies');

        $postId = $response->json('data.id');

        // 2. Update
        $this->actingAs($this->admin, 'sanctum')
            ->putJson("/api/v1/admin/blog/{$postId}", [
                'title' => 'Updated Top 10 E-commerce Strategies',
            ])
            ->assertStatus(200);

        // 3. Delete
        $this->actingAs($this->admin, 'sanctum')
            ->deleteJson("/api/v1/admin/blog/{$postId}")
            ->assertStatus(200);

        $this->assertSoftDeleted('cms_blog_posts', ['id' => $postId]);
    }
}
