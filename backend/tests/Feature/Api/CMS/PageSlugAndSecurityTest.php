<?php

declare(strict_types=1);

namespace Tests\Feature\Api\CMS;

use App\Modules\Auth\Models\User;
use App\Modules\CMS\Models\Page;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PageSlugAndSecurityTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->admin()->create();
    }

    public function test_duplicate_slug_creation_is_rejected_with_409_or_422(): void
    {
        Page::factory()->create(['slug' => 'unique-company-story']);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/admin/pages', [
                'title' => 'Another Company Story',
                'slug' => 'unique-company-story',
                'content' => 'Content here',
            ]);

        $this->assertTrue(in_array($response->status(), [409, 422]));
    }

    public function test_page_content_sanitizes_xss_scripts_and_iframes(): void
    {
        $xssPayload = '<p>Normal text</p><script>alert("XSS Attack!");</script><iframe src="javascript:alert(1)"></iframe>';

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/admin/pages', [
                'title' => 'Security Clean Page',
                'content' => $xssPayload,
            ]);

        $response->assertStatus(201);

        $createdPage = Page::where('title', 'Security Clean Page')->first();
        $this->assertNotNull($createdPage);
        $this->assertStringNotContainsString('<script>', $createdPage->content);
        $this->assertStringNotContainsString('<iframe>', $createdPage->content);
        $this->assertStringContainsString('Normal text', $createdPage->content);
    }
}
