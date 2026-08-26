<?php

declare(strict_types=1);

namespace Tests\Feature\Api\CMS;

use App\Modules\Auth\Models\User;
use App\Modules\CMS\Models\MediaFile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AdminMediaUploadTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->admin()->create();
        Storage::fake('public');
    }

    public function test_admin_can_upload_media_image(): void
    {
        $file = UploadedFile::fake()->image('banner_hero.jpg', 1200, 400);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/admin/media', [
                'file' => $file,
                'alt_text' => 'Hero Banner Image',
                'collection' => 'banners',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.original_filename', 'banner_hero.jpg')
            ->assertJsonPath('data.alt_text', 'Hero Banner Image')
            ->assertJsonPath('data.collection', 'banners');

        $this->assertDatabaseHas('media_files', [
            'original_filename' => 'banner_hero.jpg',
            'collection' => 'banners',
        ]);
    }

    public function test_invalid_mime_type_upload_is_rejected(): void
    {
        $file = UploadedFile::fake()->create('malicious.exe', 500, 'application/x-msdownload');

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/admin/media', [
                'file' => $file,
            ]);

        $response->assertStatus(422);
    }

    public function test_admin_can_list_and_delete_media_files(): void
    {
        $media = MediaFile::factory()->create();

        // List
        $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/admin/media')
            ->assertStatus(200)
            ->assertJsonPath('meta.total', 1);

        // Delete
        $this->actingAs($this->admin, 'sanctum')
            ->deleteJson("/api/v1/admin/media/{$media->id}")
            ->assertStatus(200);

        $this->assertDatabaseMissing('media_files', ['id' => $media->id]);
    }
}
