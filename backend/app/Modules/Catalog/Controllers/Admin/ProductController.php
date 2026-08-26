<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Controllers\Admin;

use App\Core\Helpers\PaginationHelper;
use App\Core\Helpers\ResponseHelper;
use App\Http\Controllers\Controller;
use App\Modules\Catalog\Models\Product;
use App\Modules\Catalog\Requests\ReorderProductImagesRequest;
use App\Modules\Catalog\Requests\StoreProductRequest;
use App\Modules\Catalog\Requests\StoreVariantRequest;
use App\Modules\Catalog\Requests\UpdateProductRequest;
use App\Modules\Catalog\Requests\UpdateProductStatusRequest;
use App\Modules\Catalog\Requests\UpdateVariantRequest;
use App\Modules\Catalog\Requests\UploadProductImagesRequest;
use App\Modules\Catalog\Resources\ProductDetailResource;
use App\Modules\Catalog\Resources\ProductImageResource;
use App\Modules\Catalog\Resources\ProductResource;
use App\Modules\Catalog\Resources\ProductVariantResource;
use App\Modules\Catalog\Services\ProductService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

/**
 * Class ProductController
 *
 * Admin Backoffice Product Management API Controller
 *
 * @package App\Modules\Catalog\Controllers\Admin
 */
class ProductController extends Controller
{
    public function __construct(
        protected ProductService $productService
    ) {
    }

    /**
     * List all products (admin view).
     */
    public function index(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', Product::class);

        $perPage = PaginationHelper::getPerPage($request);
        $filters = $request->only(['status', 'is_active', 'category_id', 'brand_id', 'search', 'sort']);

        $paginator = $this->productService->getAdminProducts($filters, $perPage);

        return ResponseHelper::paginated($paginator, ProductResource::class);
    }

    /**
     * Get single product detail (admin view).
     */
    public function show(string $id): JsonResponse
    {
        $product = $this->productService->getAdminProductById($id);

        if (!$product) {
            return ResponseHelper::notFound('Product not found.');
        }

        Gate::authorize('view', $product);

        $product->load(['category', 'categories', 'brand', 'images', 'variants.attributeValues.attribute', 'tags']);

        return ResponseHelper::success(
            new ProductDetailResource($product),
            'Product retrieved successfully.'
        );
    }

    /**
     * Create product.
     */
    public function store(StoreProductRequest $request): JsonResponse
    {
        Gate::authorize('create', Product::class);

        $dto = $request->toDTO();
        $product = $this->productService->createProduct($dto);

        return ResponseHelper::created(
            new ProductDetailResource($product),
            'Product created successfully.'
        );
    }

    /**
     * Update product.
     */
    public function update(UpdateProductRequest $request, string $id): JsonResponse
    {
        $product = $this->productService->getAdminProductById($id);
        if (!$product) {
            return ResponseHelper::notFound('Product not found.');
        }

        Gate::authorize('update', $product);

        $dto = $request->toDTO();
        $updatedProduct = $this->productService->updateProduct($id, $dto);

        return ResponseHelper::success(
            new ProductDetailResource($updatedProduct),
            'Product updated successfully.'
        );
    }

    /**
     * Soft delete product.
     */
    public function destroy(string $id): JsonResponse
    {
        $product = $this->productService->getAdminProductById($id);
        if (!$product) {
            return ResponseHelper::notFound('Product not found.');
        }

        Gate::authorize('delete', $product);

        $this->productService->deleteProduct($id);

        return ResponseHelper::success(null, 'Product deleted successfully.');
    }

    /**
     * Restore soft-deleted product.
     */
    public function restore(string $id): JsonResponse
    {
        Gate::authorize('create', Product::class);

        $restored = $this->productService->restoreProduct($id);
        if (!$restored) {
            return ResponseHelper::notFound('Product not found or not deleted.');
        }

        return ResponseHelper::success(null, 'Product restored successfully.');
    }

    /**
     * Update product status.
     */
    public function updateStatus(UpdateProductStatusRequest $request, string $id): JsonResponse
    {
        $product = $this->productService->getAdminProductById($id);
        if (!$product) {
            return ResponseHelper::notFound('Product not found.');
        }

        Gate::authorize('update', $product);

        $status = (string) $request->validated('status');
        $updated = $this->productService->updateProductStatus($id, $status);

        return ResponseHelper::success(
            new ProductResource($updated),
            'Product status updated successfully.'
        );
    }

    /**
     * Upload product gallery images.
     */
    public function uploadImages(UploadProductImagesRequest $request, string $id): JsonResponse
    {
        $product = $this->productService->getAdminProductById($id);
        if (!$product) {
            return ResponseHelper::notFound('Product not found.');
        }

        Gate::authorize('update', $product);

        $files = $request->hasFile('images') ? $request->file('images') : $request->file('image');
        $altText = $request->validated('alt_text');
        $isPrimary = (bool) ($request->validated('is_primary') ?? false);

        $images = $this->productService->uploadProductImages($id, $files, $altText, $isPrimary);

        return ResponseHelper::created(
            ProductImageResource::collection(collect($images)),
            'Images uploaded successfully.'
        );
    }

    /**
     * Delete a gallery image.
     */
    public function deleteImage(string $id, string $imageId): JsonResponse
    {
        $product = $this->productService->getAdminProductById($id);
        if (!$product) {
            return ResponseHelper::notFound('Product not found.');
        }

        Gate::authorize('update', $product);

        $this->productService->deleteProductImage($imageId);

        return ResponseHelper::success(null, 'Product image deleted successfully.');
    }

    /**
     * Reorder gallery images.
     */
    public function reorderImages(ReorderProductImagesRequest $request, string $id): JsonResponse
    {
        $product = $this->productService->getAdminProductById($id);
        if (!$product) {
            return ResponseHelper::notFound('Product not found.');
        }

        Gate::authorize('update', $product);

        $imageOrders = $request->validated('images');
        $this->productService->reorderProductImages($id, $imageOrders);

        return ResponseHelper::success(null, 'Product images reordered successfully.');
    }

    /**
     * Create a variant.
     */
    public function storeVariant(StoreVariantRequest $request, string $id): JsonResponse
    {
        $product = $this->productService->getAdminProductById($id);
        if (!$product) {
            return ResponseHelper::notFound('Product not found.');
        }

        Gate::authorize('update', $product);

        $dto = $request->toDTO();
        $variant = $this->productService->createVariant($id, $dto);

        return ResponseHelper::created(
            new ProductVariantResource($variant),
            'Product variant created successfully.'
        );
    }

    /**
     * Update a variant.
     */
    public function updateVariant(UpdateVariantRequest $request, string $id, string $variantId): JsonResponse
    {
        $product = $this->productService->getAdminProductById($id);
        if (!$product) {
            return ResponseHelper::notFound('Product not found.');
        }

        Gate::authorize('update', $product);

        $dto = $request->toDTO();
        $variant = $this->productService->updateVariant($variantId, $dto);

        return ResponseHelper::success(
            new ProductVariantResource($variant),
            'Product variant updated successfully.'
        );
    }

    /**
     * Delete a variant.
     */
    public function deleteVariant(string $id, string $variantId): JsonResponse
    {
        $product = $this->productService->getAdminProductById($id);
        if (!$product) {
            return ResponseHelper::notFound('Product not found.');
        }

        Gate::authorize('update', $product);

        $this->productService->deleteVariant($variantId);

        return ResponseHelper::success(null, 'Product variant deleted successfully.');
    }
}
