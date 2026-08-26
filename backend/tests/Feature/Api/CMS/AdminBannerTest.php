<?php

declare(strict_types=1);

namespace Tests\Feature\Api\CMS;

use App\Modules\Auth\Models\User;
use App\Modules\CMS\Models\Banner;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminBannerTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->admin()->create();
    }

    public function test_admin_can_list_banners(): void
    {
        Banner::factory()->count(3)->create();

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/admin/banners');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('meta.total', 3);
    }

    public function test_admin_can_create_banner(): void
    {
        $payload = [
            'title' => 'Black Friday Sale',
            'image_url' => 'https://example.com/banner.jpg',
            'link_url' => '/deals',
            'position' => 'hero',
            'sort_order' => 1,
            'is_active' => true,
        ];

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/admin/banners', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.title', 'Black Friday Sale');

        $this->assertDatabaseHas('cms_banners', [
            'title' => 'Black Friday Sale',
        ]);
    }

    public function test_admin_can_update_banner(): void
    {
        $banner = Banner::factory()->create(['title' => 'Old Title']);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->putJson("/api/v1/admin/banners/{$banner->id}", [
                'title' => 'New Banner Title',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.title', 'New Banner Title');
    }

    public function test_admin_can_delete_banner(): void
    {
        $banner = Banner::factory()->create();

        $response = $this->actingAs($this->admin, 'sanctum')
            ->deleteJson("/api/v1/admin/banners/{$banner->id}");

        $response->assertStatus(200);

        $this->assertDatabaseMissing('cms_banners', [
            'id' => $banner->id,
        ]);
    }
}
