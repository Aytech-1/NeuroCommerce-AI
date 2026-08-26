<?php

declare(strict_types=1);

namespace Tests\Feature\Api\CMS;

use App\Modules\Auth\Models\User;
use App\Modules\CMS\Models\Banner;
use App\Modules\CMS\Models\Faq;
use App\Modules\CMS\Models\Page;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CmsSecurityAndRbacTest extends TestCase
{
    use RefreshDatabase;

    private User $customer;
    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->customer = User::factory()->customer()->create();
        $this->admin = User::factory()->admin()->create();
    }

    public function test_customer_cannot_access_admin_cms_endpoints(): void
    {
        // Pages
        $this->actingAs($this->customer, 'sanctum')
            ->getJson('/api/v1/admin/pages')
            ->assertStatus(403);

        $this->actingAs($this->customer, 'sanctum')
            ->postJson('/api/v1/admin/pages', ['title' => 'Hacked Page'])
            ->assertStatus(403);

        // Banners
        $this->actingAs($this->customer, 'sanctum')
            ->getJson('/api/v1/admin/banners')
            ->assertStatus(403);

        // FAQs
        $this->actingAs($this->customer, 'sanctum')
            ->getJson('/api/v1/admin/faqs')
            ->assertStatus(403);

        // Media
        $this->actingAs($this->customer, 'sanctum')
            ->getJson('/api/v1/admin/media')
            ->assertStatus(403);
    }

    public function test_unauthenticated_request_to_admin_cms_returns_401(): void
    {
        $this->getJson('/api/v1/admin/pages')->assertStatus(401);
        $this->getJson('/api/v1/admin/banners')->assertStatus(401);
        $this->getJson('/api/v1/admin/faqs')->assertStatus(401);
        $this->getJson('/api/v1/admin/media')->assertStatus(401);
    }
}
