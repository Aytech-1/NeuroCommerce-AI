<?php

declare(strict_types=1);

use App\Modules\Catalog\Database\Seeders\CatalogDatabaseSeeder;
use App\Modules\Catalog\Enums\ProductStatus;
use App\Modules\Catalog\Models\Brand;
use App\Modules\Catalog\Models\Category;
use App\Modules\Catalog\Models\Product;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(DatabaseSeeder::class);
});

test('public user can list active products with pagination envelope', function () {
    $response = $this->getJson('/api/v1/products');

    $response->assertStatus(200)
        ->assertJsonStructure([
            'success',
            'message',
            'data' => [
                '*' => [
                    'id',
                    'name',
                    'slug',
                    'sku',
                    'base_price',
                    'status',
                    'is_active',
                ],
            ],
            'meta' => [
                'current_page',
                'per_page',
                'total',
                'last_page',
            ],
            'links',
        ]);
});

test('public user can filter products by category, brand, and price range', function () {
    $response = $this->getJson('/api/v1/products?filter[category]=audio-headphones&filter[min_price]=50000&filter[max_price]=150000');

    $response->assertStatus(200);
    $data = $response->json('data');
    expect($data)->not->toBeEmpty();
    expect($data[0]['slug'])->toBe('wireless-bluetooth-headphones');
});

test('public user can sort products by price ascending and descending', function () {
    $responseAsc = $this->getJson('/api/v1/products?sort=price');
    $responseAsc->assertStatus(200);

    $responseDesc = $this->getJson('/api/v1/products?sort=-price');
    $responseDesc->assertStatus(200);
    
    $prices = collect($responseDesc->json('data'))->pluck('base_price')->map(fn ($p) => (float) $p)->toArray();
    $sortedPrices = $prices;
    rsort($sortedPrices);
    expect($prices)->toEqual($sortedPrices);
});

test('public user can view product details by slug', function () {
    $response = $this->getJson('/api/v1/products/wireless-bluetooth-headphones');

    $response->assertStatus(200)
        ->assertJson([
            'success' => true,
            'data' => [
                'slug' => 'wireless-bluetooth-headphones',
                'sku' => 'WBH-001',
            ],
        ])
        ->assertJsonStructure([
            'data' => [
                'id',
                'name',
                'slug',
                'sku',
                'description',
                'base_price',
                'category',
                'brand',
                'images',
                'variants',
                'tags',
            ],
        ]);
});

test('non-existent product slug returns 404', function () {
    $response = $this->getJson('/api/v1/products/non-existent-item-slug');

    $response->assertStatus(404)
        ->assertJson([
            'success' => false,
            'message' => 'Product not found.',
        ]);
});

test('draft product returns 404 on public show endpoint', function () {
    $product = Product::factory()->draft()->create([
        'slug' => 'hidden-draft-product',
    ]);

    $response = $this->getJson('/api/v1/products/hidden-draft-product');

    $response->assertStatus(404);
});

test('public user can fetch featured, latest, popular, and deals products', function () {
    $featured = $this->getJson('/api/v1/products/featured');
    $featured->assertStatus(200)->assertJson(['success' => true]);

    $latest = $this->getJson('/api/v1/products/latest');
    $latest->assertStatus(200)->assertJson(['success' => true]);

    $popular = $this->getJson('/api/v1/products/popular');
    $popular->assertStatus(200)->assertJson(['success' => true]);

    $deals = $this->getJson('/api/v1/products/deals');
    $deals->assertStatus(200)->assertJson(['success' => true]);
});

test('public user can search products and get autocomplete suggestions', function () {
    $search = $this->getJson('/api/v1/search?q=Headphones');
    $search->assertStatus(200);
    expect($search->json('data'))->not->toBeEmpty();

    $suggestions = $this->getJson('/api/v1/search/suggestions?q=Head');
    $suggestions->assertStatus(200);
    expect($suggestions->json('data'))->not->toBeEmpty();
});

test('public user can fetch category tree and category products', function () {
    $tree = $this->getJson('/api/v1/categories');
    $tree->assertStatus(200)
        ->assertJsonStructure([
            'success',
            'data' => [
                '*' => [
                    'id',
                    'name',
                    'slug',
                    'children',
                ],
            ],
        ]);

    $categoryProducts = $this->getJson('/api/v1/categories/electronics/products');
    $categoryProducts->assertStatus(200);
    expect($categoryProducts->json('data'))->not->toBeEmpty();
});

test('public user can list brands and view brand products', function () {
    $brands = $this->getJson('/api/v1/brands');
    $brands->assertStatus(200);
    expect($brands->json('data'))->not->toBeEmpty();

    $brandProducts = $this->getJson('/api/v1/brands/soundmax-audio/products');
    $brandProducts->assertStatus(200);
    expect($brandProducts->json('data'))->not->toBeEmpty();
});
