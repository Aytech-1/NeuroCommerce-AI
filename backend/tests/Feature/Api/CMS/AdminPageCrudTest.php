<?php

declare(strict_types=1);

namespace Tests\Feature\Api\CMS;

use App\Modules\Auth\Models\User;
use App\Modules\CMS\Models\Page;
use App\Shared\Enums\PageStatus;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminPageCrudTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->admin()->create();
    }

    public function test_admin_can_list_all_pages_including_drafts(): void
    {
        Page::factory()->count(2)->published()->create();
        Page::factory()->count(3)->draft()->create();

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/admin/pages');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('meta.total', 5);
    }

    public function test_admin_can_create_new_page_with_auto_slug(): void
    {
        $payload = [
            'title' => 'Customer Privacy Rights',
            'content' => '<p>Detailed privacy policy content.</p>',
            'excerpt' => 'Privacy summary',
            'status' => 'draft',
            'template' => 'legal',
        ];

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/admin/pages', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.title', 'Customer Privacy Rights')
            ->assertJsonPath('data.slug', 'customer-privacy-rights')
            ->assertJsonPath('data.status', 'draft');

        $this->assertDatabaseHas('cms_pages', [
            'slug' => 'customer-privacy-rights',
            'status' => 'draft',
        ]);
    }

    public function test_admin_can_retrieve_single_page_by_id(): void
    {
        $page = Page::factory()->create(['title' => 'FAQ Page']);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson("/api/v1/admin/pages/{$page->id}");

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.id', $page->id)
            ->assertJsonPath('data.title', 'FAQ Page');
    }

    public function test_admin_can_update_page(): void
    {
        $page = Page::factory()->create(['title' => 'Old Title']);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->putJson("/api/v1/admin/pages/{$page->id}", [
                'title' => 'Updated New Title',
                'excerpt' => 'Updated excerpt',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.title', 'Updated New Title');

        $this->assertDatabaseHas('cms_pages', [
            'id' => $page->id,
            'title' => 'Updated New Title',
        ]);
    }

    public function test_admin_can_delete_page(): void
    {
        $page = Page::factory()->create();

        $response = $this->actingAs($this->admin, 'sanctum')
            ->deleteJson("/api/v1/admin/pages/{$page->id}");

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertSoftDeleted('cms_pages', [
            'id' => $page->id,
        ]);
    }
}
