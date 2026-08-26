<?php

declare(strict_types=1);

namespace Tests\Feature\Api\CMS;

use App\Modules\CMS\Models\Page;
use App\Shared\Enums\PageStatus;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicPageTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_user_can_list_published_pages(): void
    {
        Page::factory()->count(3)->published()->create();
        Page::factory()->count(2)->draft()->create();

        $response = $this->getJson('/api/v1/pages');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonCount(3, 'data');
    }

    public function test_public_user_can_get_published_page_by_slug(): void
    {
        $page = Page::factory()->published()->create([
            'title' => 'Terms of Service',
            'slug' => 'terms-of-service',
            'content' => '<p>These are the official terms of service.</p>',
            'meta_title' => 'Terms & Conditions',
            'meta_description' => 'Legal terms',
        ]);

        $response = $this->getJson('/api/v1/pages/terms-of-service');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.slug', 'terms-of-service')
            ->assertJsonPath('data.title', 'Terms of Service')
            ->assertJsonPath('data.seo.meta_title', 'Terms & Conditions')
            ->assertJsonPath('data.seo.meta_description', 'Legal terms');
    }

    public function test_draft_page_returns_404_for_public_user(): void
    {
        Page::factory()->draft()->create([
            'slug' => 'secret-draft-page',
        ]);

        $response = $this->getJson('/api/v1/pages/secret-draft-page');

        $response->assertStatus(404);
    }

    public function test_nonexistent_slug_returns_404(): void
    {
        $response = $this->getJson('/api/v1/pages/nonexistent-page-slug');

        $response->assertStatus(404);
    }
}
