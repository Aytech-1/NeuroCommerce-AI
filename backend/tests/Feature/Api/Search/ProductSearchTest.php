<?php

declare(strict_types=1);

namespace Tests\Feature\Api\Search;

use App\Modules\Catalog\Models\Brand;
use App\Modules\Catalog\Models\Category;
use App\Modules\Catalog\Models\Product;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductSearchTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_public_user_can_search_by_exact_product_name(): void
    {
        $response = $this->getJson('/api/v1/search?q=Wireless Bluetooth Headphones');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'success',
                'data' => [
                    '*' => ['id', 'name', 'slug', 'sku', 'base_price'],
                ],
                'meta' => ['current_page', 'per_page', 'total'],
            ]);

        $data = $response->json('data');
        $this->assertNotEmpty($data);
        $this->assertEquals('Wireless Bluetooth Headphones', $data[0]['name']);
    }

    public function test_public_user_can_search_by_sku(): void
    {
        $response = $this->getJson('/api/v1/search?q=WBH-001');

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $data = $response->json('data');
        $this->assertNotEmpty($data);
        $this->assertEquals('WBH-001', $data[0]['sku']);
    }

    public function test_public_user_can_search_by_partial_term(): void
    {
        $response = $this->getJson('/api/v1/search?q=Headphones');

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $data = $response->json('data');
        $this->assertNotEmpty($data);
    }

    public function test_empty_query_returns_all_visible_products_paginated(): void
    {
        $response = $this->getJson('/api/v1/search');

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertGreaterThan(0, $response->json('meta.total'));
    }

    public function test_search_for_nonexistent_term_returns_empty_paginated_array(): void
    {
        $response = $this->getJson('/api/v1/search?q=XYZNonExistentKeyword123456');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonCount(0, 'data');
    }
}
