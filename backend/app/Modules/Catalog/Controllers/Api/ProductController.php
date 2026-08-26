<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Controllers\Api;

use App\Core\Helpers\PaginationHelper;
use App\Core\Helpers\ResponseHelper;
use App\Http\Controllers\Controller;
use App\Modules\Catalog\DTOs\SearchQueryDTO;
use App\Modules\Catalog\Resources\ProductDetailResource;
use App\Modules\Catalog\Resources\ProductResource;
use App\Modules\Catalog\Resources\SearchSuggestionResource;
use App\Modules\Catalog\Services\ProductService;
use App\Modules\Catalog\Services\SearchService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Class ProductController
 *
 * Public Storefront Product API Controller
 *
 * @package App\Modules\Catalog\Controllers\Api
 */
class ProductController extends Controller
{
    public function __construct(
        protected ProductService $productService,
        protected SearchService $searchService
    ) {
    }

    /**
     * List products (filterable, sortable, paginated).
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = PaginationHelper::getPerPage($request);
        $filters = $request->query('filter', []);
        if ($request->has('sort')) {
            $filters['sort'] = $request->query('sort');
        }

        $paginator = $this->productService->getPublicProducts($filters, $perPage);

        return ResponseHelper::paginated($paginator, ProductResource::class);
    }

    /**
     * Get product by slug.
     */
    public function show(string $slug): JsonResponse
    {
        $product = $this->productService->getPublicProductBySlug($slug);

        if (!$product) {
            return ResponseHelper::notFound('Product not found.');
        }

        return ResponseHelper::success(
            new ProductDetailResource($product),
            'Product retrieved successfully.'
        );
    }

    /**
     * Get featured products.
     */
    public function featured(Request $request): JsonResponse
    {
        $limit = min((int) ($request->query('limit', 10)), 50);
        $products = $this->productService->getFeaturedProducts($limit);

        return ResponseHelper::success(
            ProductResource::collection($products),
            'Featured products retrieved successfully.'
        );
    }

    /**
     * Get latest products.
     */
    public function latest(Request $request): JsonResponse
    {
        $limit = min((int) ($request->query('limit', 10)), 50);
        $products = $this->productService->getLatestProducts($limit);

        return ResponseHelper::success(
            ProductResource::collection($products),
            'Latest products retrieved successfully.'
        );
    }

    /**
     * Get popular products.
     */
    public function popular(Request $request): JsonResponse
    {
        $limit = min((int) ($request->query('limit', 10)), 50);
        $products = $this->productService->getPopularProducts($limit);

        return ResponseHelper::success(
            ProductResource::collection($products),
            'Popular products retrieved successfully.'
        );
    }

    /**
     * Get discounted deals.
     */
    public function deals(Request $request): JsonResponse
    {
        $perPage = PaginationHelper::getPerPage($request);
        $paginator = $this->productService->getDeals($perPage);

        return ResponseHelper::paginated($paginator, ProductResource::class);
    }

    /**
     * Full-text product search.
     */
    public function search(Request $request): JsonResponse
    {
        $dto = SearchQueryDTO::fromArray($request->all());
        $paginator = $this->searchService->search($dto);

        return ResponseHelper::paginated($paginator, ProductResource::class);
    }

    /**
     * Search autocomplete suggestions.
     */
    public function suggestions(Request $request): JsonResponse
    {
        $query = (string) $request->query('q', '');
        $limit = min((int) ($request->query('limit', 5)), 20);

        $suggestions = $this->searchService->getSuggestions($query, $limit);

        return ResponseHelper::success(
            SearchSuggestionResource::collection($suggestions),
            'Search suggestions retrieved successfully.'
        );
    }
}
