<?php

declare(strict_types=1);

use App\Modules\Auth\Models\User;
use App\Modules\Catalog\Models\Brand;
use App\Modules\Catalog\Models\Category;
use App\Modules\Catalog\Models\Product;
use App\Modules\Catalog\Models\ProductAttribute;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(DatabaseSeeder::class);
    $this->superAdmin = User::where('email', 'admin@neurocommerce.com')->first();
    $this->customer = User::factory()->create(['user_type' => 'customer']);
});

test('admin can list all products including drafts and archived', function () {
    Product::factory()->draft()->create(['name' => 'Draft Product Spec']);
    Sanctum::actingAs($this->superAdmin, ['*']);

    $response = $this->getJson('/api/v1/admin/products');

    $response->assertStatus(200)
        ->assertJsonStructure([
            'success',
            'data' => [
                '*' => [
                    'id',
                    'name',
                    'sku',
                    'status',
                ],
            ],
            'meta',
        ]);
});

test('admin can create, update, and soft delete a product', function () {
    Sanctum::actingAs($this->superAdmin, ['*']);
    $category = Category::first();
    $brand = Brand::first();

    $createPayload = [
        'name' => 'Quantum Precision Smartwatch',
        'sku' => 'QPS-001',
        'base_price' => 199.99,
        'category_id' => $category->id,
        'brand_id' => $brand->id,
        'description' => 'Biometric heart rate monitor.',
        'status' => 'active',
        'tags' => ['smartwatch', 'wearables'],
    ];

    $createResponse = $this->postJson('/api/v1/admin/products', $createPayload);
    $createResponse->assertStatus(201)
        ->assertJson([
            'success' => true,
            'data' => [
                'name' => 'Quantum Precision Smartwatch',
                'sku' => 'QPS-001',
            ],
        ]);

    $productId = $createResponse->json('data.id');

    // Update Product
    $updatePayload = [
        'name' => 'Quantum Precision Smartwatch V2',
        'base_price' => 229.99,
    ];

    $updateResponse = $this->putJson("/api/v1/admin/products/{$productId}", $updatePayload);
    $updateResponse->assertStatus(200)
        ->assertJson([
            'success' => true,
            'data' => [
                'name' => 'Quantum Precision Smartwatch V2',
                'base_price' => '229.9900',
            ],
        ]);

    // Status toggle
    $statusResponse = $this->patchJson("/api/v1/admin/products/{$productId}/status", [
        'status' => 'archived',
    ]);
    $statusResponse->assertStatus(200)->assertJson(['data' => ['status' => 'archived']]);

    // Soft delete
    $deleteResponse = $this->deleteJson("/api/v1/admin/products/{$productId}");
    $deleteResponse->assertStatus(200);

    // Restore
    $restoreResponse = $this->postJson("/api/v1/admin/products/{$productId}/restore");
    $restoreResponse->assertStatus(200);
});

test('admin can upload images, reorder gallery, and delete image', function () {
    Storage::fake('public');
    Sanctum::actingAs($this->superAdmin, ['*']);
    $product = Product::first();

    $file = UploadedFile::fake()->image('test_product.jpg');

    $uploadResponse = $this->postJson("/api/v1/admin/products/{$product->id}/images", [
        'image' => $file,
        'alt_text' => 'Side profile view',
        'is_primary' => true,
    ]);

    $uploadResponse->assertStatus(201);
    $imageId = $uploadResponse->json('data.0.id');
    expect($imageId)->not->toBeNull();

    // Reorder
    $reorderResponse = $this->putJson("/api/v1/admin/products/{$product->id}/images/reorder", [
        'images' => [
            ['id' => $imageId, 'sort_order' => 5],
        ],
    ]);
    $reorderResponse->assertStatus(200);

    // Delete
    $deleteResponse = $this->deleteJson("/api/v1/admin/products/{$product->id}/images/{$imageId}");
    $deleteResponse->assertStatus(200);
});

test('admin can create, update, and delete product variants', function () {
    Sanctum::actingAs($this->superAdmin, ['*']);
    $product = Product::first();
    $attribute = ProductAttribute::with('values')->first();
    $attrValue = $attribute->values->first();

    $variantPayload = [
        'sku' => 'TEST-VAR-101',
        'name' => 'Custom Edition',
        'price' => 89.99,
        'attribute_value_ids' => [$attrValue->id],
    ];

    $createVariant = $this->postJson("/api/v1/admin/products/{$product->id}/variants", $variantPayload);
    $createVariant->assertStatus(201)
        ->assertJson([
            'success' => true,
            'data' => [
                'sku' => 'TEST-VAR-101',
            ],
        ]);

    $variantId = $createVariant->json('data.id');

    // Update variant
    $updateVariant = $this->putJson("/api/v1/admin/products/{$product->id}/variants/{$variantId}", [
        'price' => 95.00,
    ]);
    $updateVariant->assertStatus(200)
        ->assertJson([
            'data' => [
                'price' => '95.0000',
            ],
        ]);

    // Delete variant
    $deleteVariant = $this->deleteJson("/api/v1/admin/products/{$product->id}/variants/{$variantId}");
    $deleteVariant->assertStatus(200);
});

test('admin can manage categories, brands, and attributes', function () {
    Sanctum::actingAs($this->superAdmin, ['*']);

    // 1. Categories
    $categoryCreate = $this->postJson('/api/v1/admin/categories', [
        'name' => 'Gaming & VR',
        'description' => 'Virtual reality headsets and accessories.',
    ]);
    $categoryCreate->assertStatus(201);
    $catId = $categoryCreate->json('data.id');

    $catUpdate = $this->putJson("/api/v1/admin/categories/{$catId}", [
        'name' => 'Gaming & Immersive VR',
    ]);
    $catUpdate->assertStatus(200);

    // 2. Brands
    $brandCreate = $this->postJson('/api/v1/admin/brands', [
        'name' => 'Oculus Dynamics',
        'website_url' => 'https://oculus.example.com',
    ]);
    $brandCreate->assertStatus(201);
    $brandId = $brandCreate->json('data.id');

    $brandUpdate = $this->putJson("/api/v1/admin/brands/{$brandId}", [
        'name' => 'Oculus Dynamics Global',
    ]);
    $brandUpdate->assertStatus(200);

    // 3. Attributes
    $attrCreate = $this->postJson('/api/v1/admin/attributes', [
        'name' => 'Connectivity',
        'type' => 'select',
    ]);
    $attrCreate->assertStatus(201);
    $attrId = $attrCreate->json('data.id');

    $valueCreate = $this->postJson("/api/v1/admin/attributes/{$attrId}/values", [
        'value' => 'Wi-Fi 7',
    ]);
    $valueCreate->assertStatus(201);
    $valId = $valueCreate->json('data.id');

    $valueDelete = $this->deleteJson("/api/v1/admin/attributes/{$attrId}/values/{$valId}");
    $valueDelete->assertStatus(200);

    $attrDelete = $this->deleteJson("/api/v1/admin/attributes/{$attrId}");
    $attrDelete->assertStatus(200);
});

test('customer cannot access admin catalog endpoints and gets 403', function () {
    Sanctum::actingAs($this->customer, ['*']);

    $response = $this->getJson('/api/v1/admin/products');
    $response->assertStatus(403);

    $createResponse = $this->postJson('/api/v1/admin/products', [
        'name' => 'Unauthorized Product',
        'sku' => 'UNAUTH-01',
        'base_price' => 10,
    ]);
    $createResponse->assertStatus(403);
});

test('unauthenticated request to admin endpoints returns 401', function () {
    $response = $this->getJson('/api/v1/admin/products');
    $response->assertStatus(401);
});

test('validation errors return 422 standard envelope', function () {
    Sanctum::actingAs($this->superAdmin, ['*']);

    $response = $this->postJson('/api/v1/admin/products', [
        'name' => '', // missing required
    ]);

    $response->assertStatus(422)
        ->assertJson([
            'success' => false,
            'code' => 'VALIDATION_ERROR',
        ])
        ->assertJsonStructure([
            'message',
            'code',
            'errors' => ['name', 'sku', 'base_price'],
        ]);
});
