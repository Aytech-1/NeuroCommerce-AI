<?php

declare(strict_types=1);

namespace Tests\Feature\Api\Search;

use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SearchFilteringAndSortingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_user_can_filter_search_by_category_and_price_range(): void
    {
        $response = $this->getJson('/api/v1/search?filter[category]=audio-headphones&filter[min_price]=50&filter[max_price]=150');

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $data = $response->json('data');
        $this->assertNotEmpty($data);
        foreach ($data as $product) {
            $this->assertGreaterThanOrEqual(50, (float) $product['base_price']);
            $this->assertLessThanOrEqual(150, (float) $product['base_price']);
        }
    }

    public function test_user_can_filter_search_by_brand(): void
    {
        $response = $this->getJson('/api/v1/search?filter[brand]=soundmax-audio');

        $response->assertStatus(200);
        $data = $response->json('data');
        $this->assertNotEmpty($data);
    }

    public function test_user_can_sort_search_results_by_price_ascending_and_descending(): void
    {
        $responseAsc = $this->getJson('/api/v1/search?sort=base_price');
        $responseAsc->assertStatus(200);

        $responseDesc = $this->getJson('/api/v1/search?sort=-base_price');
        $responseDesc->assertStatus(200);

        $pricesAsc = collect($responseAsc->json('data'))->pluck('base_price')->map(fn ($p) => (float) $p)->toArray();
        $sortedAsc = $pricesAsc;
        sort($sortedAsc);
        $this->assertEquals($sortedAsc, $pricesAsc);

        $pricesDesc = collect($responseDesc->json('data'))->pluck('base_price')->map(fn ($p) => (float) $p)->toArray();
        $sortedDesc = $pricesDesc;
        rsort($sortedDesc);
        $this->assertEquals($sortedDesc, $pricesDesc);
    }
}
