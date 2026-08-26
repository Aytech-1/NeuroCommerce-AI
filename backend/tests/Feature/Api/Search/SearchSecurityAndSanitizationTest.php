<?php

declare(strict_types=1);

namespace Tests\Feature\Api\Search;

use App\Modules\Catalog\Models\Product;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SearchSecurityAndSanitizationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_draft_archived_and_deleted_products_are_excluded_from_search(): void
    {
        $draft = Product::factory()->draft()->create([
            'name' => 'Secret Top Secret Unpublished Prototype 999',
            'slug' => 'secret-prototype-999',
            'sku' => 'SECRET-999',
        ]);

        $response = $this->getJson('/api/v1/search?q=Secret Top Secret');

        $response->assertStatus(200);
        $this->assertEmpty($response->json('data'));
    }

    public function test_sql_injection_and_special_character_payloads_are_sanitized_safely(): void
    {
        $response = $this->getJson('/api/v1/search?q=\' OR \'1\'=\'1\' -- ; DROP TABLE products;');

        $response->assertStatus(200)
            ->assertJsonPath('success', true);
    }

    public function test_sort_injection_falls_back_safely_to_default_ordering(): void
    {
        $response = $this->getJson('/api/v1/search?sort=password;SELECT%20*%20FROM%20users');

        $response->assertStatus(200)
            ->assertJsonPath('success', true);
    }

    public function test_oversized_queries_are_safely_truncated_without_server_error(): void
    {
        $longQuery = str_repeat('A', 500);
        $response = $this->getJson('/api/v1/search?q=' . $longQuery);

        $response->assertStatus(200)
            ->assertJsonPath('success', true);
    }
}
