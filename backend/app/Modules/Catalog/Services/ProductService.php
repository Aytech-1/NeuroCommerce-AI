<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Services;

use App\Core\Abstracts\AbstractService;
use App\Modules\Catalog\Contracts\ProductRepositoryInterface;
use App\Modules\Catalog\DTOs\CreateProductDTO;
use App\Modules\Catalog\DTOs\CreateVariantDTO;
use App\Modules\Catalog\DTOs\UpdateProductDTO;
use App\Modules\Catalog\DTOs\UpdateVariantDTO;
use App\Modules\Catalog\Events\ProductCreated;
use App\Modules\Catalog\Events\ProductDeleted;
use App\Modules\Catalog\Events\ProductUpdated;
use App\Modules\Catalog\Jobs\SyncProductSearchIndexJob;
use App\Modules\Catalog\Models\Product;
use App\Modules\Catalog\Models\ProductImage;
use App\Modules\Catalog\Models\ProductVariant;
use App\Modules\Catalog\Models\Tag;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Class ProductService
 *
 * @package App\Modules\Catalog\Services
 */
class ProductService extends AbstractService
{
    public function __construct(
        protected ProductRepositoryInterface $productRepository
    ) {
    }

    /**
     * Get public product details by slug.
     */
    public function getPublicProductBySlug(string $slug): ?Product
    {
        return $this->productRepository->findPublicBySlug($slug);
    }

    /**
     * Get paginated public products.
     */
    public function getPublicProducts(array $filters, int $perPage = 20): LengthAwarePaginator
    {
        return $this->productRepository->getPaginatedPublic($filters, $perPage);
    }

    /**
     * Get paginated admin products.
     */
    public function getAdminProducts(array $filters, int $perPage = 20): LengthAwarePaginator
    {
        return $this->productRepository->getPaginatedAdmin($filters, $perPage);
    }

    /**
     * Get admin product by ID.
     */
    public function getAdminProductById(string $id): ?Product
    {
        return $this->productRepository->findById($id);
    }

    /**
     * Get featured products.
     */
    public function getFeaturedProducts(int $limit = 10): Collection
    {
        return $this->productRepository->getFeatured($limit);
    }

    /**
     * Get latest products.
     */
    public function getLatestProducts(int $limit = 10): Collection
    {
        return $this->productRepository->getLatest($limit);
    }

    /**
     * Get popular products.
     */
    public function getPopularProducts(int $limit = 10): Collection
    {
        return $this->productRepository->getPopular($limit);
    }

    /**
     * Get deal products.
     */
    public function getDeals(int $perPage = 20): LengthAwarePaginator
    {
        return $this->productRepository->getDeals($perPage);
    }

    /**
     * Search products.
     */
    public function search(string $query, array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        return $this->productRepository->search($query, $filters, $perPage);
    }

    /**
     * Autocomplete suggestions.
     */
    public function getSearchSuggestions(string $query, int $limit = 5): Collection
    {
        return $this->productRepository->getSearchSuggestions($query, $limit);
    }

    /**
     * Create a new product.
     */
    public function createProduct(CreateProductDTO $dto): Product
    {
        return $this->executeInTransaction(function () use ($dto) {
            $data = $dto->toArray();
            
            // Handle slug generation
            if (empty($data['slug'])) {
                $baseSlug = Str::slug($data['name']);
                $slug = $baseSlug;
                $counter = 1;
                while (Product::where('slug', $slug)->exists()) {
                    $slug = $baseSlug . '-' . $counter++;
                }
                $data['slug'] = $slug;
            }

            // Extract relations data
            $tags = $data['tags'] ?? null;
            $categoryIds = $data['category_ids'] ?? null;
            unset($data['tags'], $data['category_ids']);

            /** @var Product $product */
            $product = $this->productRepository->create($data);

            // Sync secondary categories
            if (!empty($categoryIds)) {
                $product->categories()->sync($categoryIds);
            }

            // Sync tags
            if (!empty($tags)) {
                $tagIds = [];
                foreach ($tags as $tagName) {
                    $tagSlug = Str::slug($tagName);
                    $tag = Tag::firstOrCreate(
                        ['slug' => $tagSlug],
                        ['name' => trim($tagName)]
                    );
                    $tagIds[] = $tag->id;
                }
                $product->tags()->sync($tagIds);
            }

            $this->dispatchDomainEvent(new ProductCreated($product));
            SyncProductSearchIndexJob::dispatch($product->id, 'index');

            return $product->fresh(['category', 'categories', 'brand', 'tags']);
        });
    }

    /**
     * Update an existing product.
     */
    public function updateProduct(string $id, UpdateProductDTO $dto): Product
    {
        return $this->executeInTransaction(function () use ($id, $dto) {
            $data = array_filter($dto->toArray(), fn ($v) => $v !== null);

            $tags = $data['tags'] ?? null;
            $categoryIds = $data['category_ids'] ?? null;
            unset($data['tags'], $data['category_ids']);

            /** @var Product $product */
            $product = $this->productRepository->update($id, $data);

            if ($categoryIds !== null) {
                $product->categories()->sync($categoryIds);
            }

            if ($tags !== null) {
                $tagIds = [];
                foreach ($tags as $tagName) {
                    $tagSlug = Str::slug($tagName);
                    $tag = Tag::firstOrCreate(
                        ['slug' => $tagSlug],
                        ['name' => trim($tagName)]
                    );
                    $tagIds[] = $tag->id;
                }
                $product->tags()->sync($tagIds);
            }

            $this->dispatchDomainEvent(new ProductUpdated($product));
            SyncProductSearchIndexJob::dispatch($product->id, 'update');

            return $product->fresh(['category', 'categories', 'brand', 'tags', 'images', 'variants']);
        });
    }

    /**
     * Update product status.
     */
    public function updateProductStatus(string $id, string $status): Product
    {
        return $this->executeInTransaction(function () use ($id, $status) {
            /** @var Product $product */
            $product = $this->productRepository->update($id, ['status' => $status]);
            $this->dispatchDomainEvent(new ProductUpdated($product));

            return $product;
        });
    }

    /**
     * Soft delete product.
     */
    public function deleteProduct(string $id): bool
    {
        return $this->executeInTransaction(function () use ($id) {
            $product = $this->productRepository->findById($id);
            if (!$product) {
                return false;
            }

            $deleted = $this->productRepository->delete($id);
            if ($deleted) {
                $this->dispatchDomainEvent(new ProductDeleted($product));
                SyncProductSearchIndexJob::dispatch($id, 'delete');
            }

            return $deleted;
        });
    }

    /**
     * Restore product.
     */
    public function restoreProduct(string $id): bool
    {
        return $this->executeInTransaction(function () use ($id) {
            $restored = $this->productRepository->restore($id);
            if ($restored) {
                SyncProductSearchIndexJob::dispatch($id, 'index');
            }

            return $restored;
        });
    }

    /**
     * Create variant for product.
     */
    public function createVariant(string $productId, CreateVariantDTO $dto): ProductVariant
    {
        $data = $dto->toArray();
        $attributeValueIds = $data['attribute_value_ids'] ?? [];
        unset($data['attribute_value_ids']);

        return $this->productRepository->addVariant($productId, $data, $attributeValueIds);
    }

    /**
     * Update variant.
     */
    public function updateVariant(string $variantId, UpdateVariantDTO $dto): ProductVariant
    {
        $data = array_filter($dto->toArray(), fn ($v) => $v !== null);
        $attributeValueIds = $data['attribute_value_ids'] ?? null;
        unset($data['attribute_value_ids']);

        return $this->productRepository->updateVariant($variantId, $data, $attributeValueIds);
    }

    /**
     * Delete variant.
     */
    public function deleteVariant(string $variantId): bool
    {
        return $this->productRepository->deleteVariant($variantId);
    }

    /**
     * Upload product image(s).
     */
    public function uploadProductImages(string $productId, array|UploadedFile $files, ?string $altText = null, bool $isPrimary = false): array
    {
        $uploaded = [];
        $fileList = is_array($files) ? $files : [$files];

        foreach ($fileList as $index => $file) {
            if (!$file instanceof UploadedFile) {
                continue;
            }

            $filename = Str::uuid()->toString() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('products/' . $productId, $filename, 'public');
            $url = Storage::disk('public')->url($path);

            $image = $this->productRepository->addImage($productId, [
                'url' => $url,
                'alt_text' => $altText,
                'is_primary' => $index === 0 && $isPrimary,
                'sort_order' => $index,
            ]);

            $uploaded[] = $image;
        }

        return $uploaded;
    }

    /**
     * Delete product image.
     */
    public function deleteProductImage(string $imageId): bool
    {
        return $this->productRepository->deleteImage($imageId);
    }

    /**
     * Reorder product images.
     */
    public function reorderProductImages(string $productId, array $imageOrders): bool
    {
        return $this->productRepository->reorderImages($productId, $imageOrders);
    }
}
