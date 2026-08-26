<?php

declare(strict_types=1);

namespace Tests\Feature\Api\CMS;

use App\Modules\Auth\Models\User;
use App\Modules\CMS\Models\Faq;
use App\Modules\CMS\Models\Testimonial;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminFaqAndTestimonialTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->admin()->create();
    }

    public function test_admin_can_crud_faq(): void
    {
        // 1. Create FAQ
        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/admin/faqs', [
                'question' => 'How to cancel an order?',
                'answer' => 'Go to orders page and click cancel.',
                'category' => 'Orders',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.question', 'How to cancel an order?');

        $faqId = $response->json('data.id');

        // 2. Update FAQ
        $this->actingAs($this->admin, 'sanctum')
            ->putJson("/api/v1/admin/faqs/{$faqId}", [
                'answer' => 'Updated answer on order cancellation.',
            ])
            ->assertStatus(200);

        // 3. Delete FAQ
        $this->actingAs($this->admin, 'sanctum')
            ->deleteJson("/api/v1/admin/faqs/{$faqId}")
            ->assertStatus(200);

        $this->assertDatabaseMissing('cms_faqs', ['id' => $faqId]);
    }

    public function test_admin_can_crud_testimonial(): void
    {
        // 1. Create Testimonial
        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/admin/testimonials', [
                'customer_name' => 'John Doe',
                'company' => 'Acme Corp',
                'content' => 'Exceptional service and quick delivery!',
                'rating' => 5,
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.customer_name', 'John Doe');

        $testimonialId = $response->json('data.id');

        // 2. Update Testimonial
        $this->actingAs($this->admin, 'sanctum')
            ->putJson("/api/v1/admin/testimonials/{$testimonialId}", [
                'rating' => 4,
            ])
            ->assertStatus(200);

        // 3. Delete Testimonial
        $this->actingAs($this->admin, 'sanctum')
            ->deleteJson("/api/v1/admin/testimonials/{$testimonialId}")
            ->assertStatus(200);

        $this->assertDatabaseMissing('cms_testimonials', ['id' => $testimonialId]);
    }
}
