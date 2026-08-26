<?php

declare(strict_types=1);

namespace Tests\Feature\Api\Search;

use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SearchSuggestionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_public_user_can_retrieve_prefix_suggestions(): void
    {
        $response = $this->getJson('/api/v1/search/suggestions?q=Wire');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'success',
                'data' => [
                    '*' => ['id', 'name', 'slug', 'sku', 'base_price', 'category'],
                ],
            ]);

        $data = $response->json('data');
        $this->assertNotEmpty($data);
        $this->assertStringContainsStringIgnoringCase('wire', $data[0]['name']);
    }

    public function test_suggestions_respect_limit_parameter(): void
    {
        $response = $this->getJson('/api/v1/search/suggestions?q=a&limit=2');

        $response->assertStatus(200);
        $this->assertLessThanOrEqual(2, count($response->json('data')));
    }

    public function test_empty_suggestions_query_returns_empty_array(): void
    {
        $response = $this->getJson('/api/v1/search/suggestions?q=');

        $response->assertStatus(200)
            ->assertJsonPath('data', []);
    }
}
