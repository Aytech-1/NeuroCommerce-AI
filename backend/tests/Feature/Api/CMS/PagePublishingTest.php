<?php

declare(strict_types=1);

namespace Tests\Feature\Api\CMS;

use App\Modules\Auth\Models\User;
use App\Modules\CMS\Models\Page;
use App\Shared\Enums\PageStatus;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PagePublishingTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->admin()->create();
    }

    public function test_admin_can_toggle_publish_status(): void
    {
        $page = Page::factory()->draft()->create();

        // 1. Publish page
        $response = $this->actingAs($this->admin, 'sanctum')
            ->patchJson("/api/v1/admin/pages/{$page->id}/publish");

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'published');

        $this->assertDatabaseHas('cms_pages', [
            'id' => $page->id,
            'status' => 'published',
        ]);

        // 2. Unpublish back to draft
        $response2 = $this->actingAs($this->admin, 'sanctum')
            ->patchJson("/api/v1/admin/pages/{$page->id}/publish");

        $response2->assertStatus(200)
            ->assertJsonPath('data.status', 'draft');

        $this->assertDatabaseHas('cms_pages', [
            'id' => $page->id,
            'status' => 'draft',
        ]);
    }

    public function test_published_page_becomes_immediately_publicly_visible(): void
    {
        $page = Page::factory()->draft()->create([
            'slug' => 'investor-relations',
        ]);

        // Verify draft returns 404 publicly
        $this->getJson('/api/v1/pages/investor-relations')->assertStatus(404);

        // Publish via admin
        $this->actingAs($this->admin, 'sanctum')
            ->patchJson("/api/v1/admin/pages/{$page->id}/publish")
            ->assertStatus(200);

        // Verify public endpoint now returns 200
        $this->getJson('/api/v1/pages/investor-relations')
            ->assertStatus(200)
            ->assertJsonPath('data.slug', 'investor-relations');
    }
}
