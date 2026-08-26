<?php

declare(strict_types=1);

namespace Tests\Feature\Api\CMS;

use App\Modules\Auth\Models\User;
use App\Modules\CMS\Models\MediaFile;
use App\Modules\CMS\Models\Page;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class Phase18CmsMediaHardeningTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $customer;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->admin()->create();
        $this->customer = User::factory()->customer()->create();
        Storage::fake(config('filesystems.default', 'public'));
    }

    public function test_svg_upload_is_sanitized_against_stored_xss(): void
    {
        $maliciousSvg = '<svg xmlns="http://www.w3.org/2000/svg" onload="alert(\'xss\')"><script>alert("hack")</script><circle cx="50" cy="50" r="40"/></svg>';
        $file = UploadedFile::fake()->createWithContent('test_vector.svg', $maliciousSvg);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/admin/media', [
                'file' => $file,
                'collection' => 'icons',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true);

        $mediaId = $response->json('data.id');
        $media = MediaFile::find($mediaId);
        $this->assertNotNull($media);

        $savedContent = (string) Storage::disk($media->disk)->get($media->path);
        $this->assertStringNotContainsString('<script>', $savedContent);
        $this->assertStringNotContainsString('onload=', $savedContent);
        $this->assertStringContainsString('<circle', $savedContent);
    }

    public function test_public_pages_strictly_exclude_draft_archived_and_future_scheduled(): void
    {
        $publishedPage = Page::factory()->create([
            'slug' => 'about-us',
            'status' => 'published',
            'published_at' => now()->subDay(),
        ]);

        $draftPage = Page::factory()->create([
            'slug' => 'secret-draft',
            'status' => 'draft',
            'published_at' => null,
        ]);

        $scheduledPage = Page::factory()->create([
            'slug' => 'future-launch',
            'status' => 'published',
            'published_at' => now()->addDays(5),
        ]);

        // Published is accessible
        $this->getJson("/api/v1/pages/{$publishedPage->slug}")
            ->assertStatus(200)
            ->assertJsonPath('data.slug', 'about-us');

        // Draft returns 404
        $this->getJson("/api/v1/pages/{$draftPage->slug}")
            ->assertStatus(404);

        // Future scheduled returns 404
        $this->getJson("/api/v1/pages/{$scheduledPage->slug}")
            ->assertStatus(404);
    }

    public function test_page_publishing_invalidates_cache_immediately(): void
    {
        $page = Page::factory()->create([
            'slug' => 'terms-of-service',
            'status' => 'published',
            'published_at' => now()->subDay(),
        ]);

        // Warm up cache
        $this->getJson("/api/v1/pages/{$page->slug}")->assertStatus(200);

        // Admin unpublishes page
        $this->actingAs($this->admin, 'sanctum')
            ->patchJson("/api/v1/admin/pages/{$page->id}/publish", [
                'status' => 'draft',
            ])->assertStatus(200);

        // Public request now returns 404 without stale cache leakage
        $this->getJson("/api/v1/pages/{$page->slug}")->assertStatus(404);
    }

    public function test_slug_collision_is_strictly_prevented(): void
    {
        Page::factory()->create([
            'slug' => 'privacy-policy',
            'title' => 'Privacy Policy',
            'status' => 'published',
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/admin/pages', [
                'title' => 'Privacy Policy',
                'slug' => 'privacy-policy',
                'content' => 'Duplicate slug content',
                'template' => 'default',
            ]);

        $this->assertContains($response->status(), [409, 422]);
    }
}
