<?php

declare(strict_types=1);

use App\Modules\Cart\Services\CartService;
use App\Modules\Catalog\Models\Product;
use App\Modules\Catalog\Models\ProductVariant;
use App\Modules\Catalog\Resources\ProductVariantResource;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(DatabaseSeeder::class);
    $this->cartService = app(CartService::class);
    $this->sessionId = (string) Str::uuid();
});

test('missing cart currency uses configured NGN default', function () {
    $cart = $this->cartService->getOrCreateCart(null, $this->sessionId);

    expect($cart->currency_code)->toBe('NGN');
});

test('explicit USD currency remains USD', function () {
    $cart = $this->cartService->getOrCreateCart(null, (string) Str::uuid(), 'USD');

    expect($cart->currency_code)->toBe('USD');
});

test('explicit EUR currency remains EUR', function () {
    $cart = $this->cartService->getOrCreateCart(null, (string) Str::uuid(), 'EUR');

    expect($cart->currency_code)->toBe('EUR');
});

test('variant resource returns both attributes and attribute_values when loaded', function () {
    $variant = ProductVariant::first();

    if (!$variant) {
        $product = Product::first();
        $variant = ProductVariant::create([
            'product_id' => $product->id,
            'sku' => 'TEST-SKU-001',
            'name' => 'Test Variant',
            'price' => 15000.00,
            'is_active' => true,
        ]);
    }

    $variant->load('attributeValues.attribute');

    $resource = new ProductVariantResource($variant);
    $response = $resource->toArray(Request::create('/api/v1/products'));

    expect($response)->toHaveKeys(['id', 'sku', 'name', 'price', 'attributes', 'attribute_values']);
});