<?php

declare(strict_types=1);

namespace Tests\Feature\Api\CMS;

use App\Modules\CMS\Models\Banner;
use App\Modules\CMS\Models\Faq;
use App\Modules\CMS\Models\Page;
use App\Modules\CMS\Models\Testimonial;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicCmsEndpointsTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_user_can_get_homepage_aggregated_content(): void
    {
        Banner::factory()->create(['position' => 'hero', 'is_active' => true]);
        Faq::factory()->create(['is_active' => true]);
        Testimonial::factory()->create(['is_active' => true]);

        $response = $this->getJson('/api/v1/cms/homepage');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'data' => [
                    'hero_banners',
                    'promo_banners',
                    'featured_posts',
                    'testimonials',
                    'faqs',
                ],
            ]);
    }

    public function test_public_user_can_get_active_banners(): void
    {
        Banner::factory()->count(2)->create(['is_active' => true]);
        Banner::factory()->inactive()->create();

        $response = $this->getJson('/api/v1/cms/banners');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonCount(2, 'data');
    }

    public function test_public_user_can_get_active_faqs(): void
    {
        Faq::factory()->count(3)->create(['is_active' => true]);

        $response = $this->getJson('/api/v1/cms/faqs');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonCount(3, 'data');
    }

    public function test_public_user_can_get_testimonials(): void
    {
        Testimonial::factory()->count(2)->create(['is_active' => true]);

        $response = $this->getJson('/api/v1/cms/testimonials');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonCount(2, 'data');
    }

    public function test_public_user_can_submit_contact_form(): void
    {
        $payload = [
            'name' => 'Alice Johnson',
            'email' => 'alice@example.com',
            'subject' => 'Product Inquiry',
            'message' => 'I would like to inquire about bulk enterprise orders.',
            'phone' => '+1234567890',
        ];

        $response = $this->postJson('/api/v1/cms/contact', $payload);

        $response->assertStatus(200)
            ->assertJsonPath('success', true);
    }

    public function test_public_user_can_get_navigation_hierarchy(): void
    {
        Page::factory()->count(3)->published()->create();

        $response = $this->getJson('/api/v1/cms/navigation');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'data' => [
                    'header',
                    'footer',
                ],
            ]);
    }
}
