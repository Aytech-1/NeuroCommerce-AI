<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Controllers\Api;

use App\Core\Helpers\PaginationHelper;
use App\Core\Helpers\ResponseHelper;
use App\Http\Controllers\Controller;
use App\Modules\Catalog\Resources\CategoryResource;
use App\Modules\Catalog\Resources\ProductResource;
use App\Modules\Catalog\Services\CategoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Class CategoryController
 *
 * Public Storefront Category API Controller
 *
 * @package App\Modules\Catalog\Controllers\Api
 */
class CategoryController extends Controller
{
    public function __construct(
        protected CategoryService $categoryService
    ) {
    }

    /**
     * Get full category hierarchy tree.
     */
    public function index(): JsonResponse
    {
        $tree = $this->categoryService->getCategoryTree();

        return ResponseHelper::success(
            CategoryResource::collection($tree),
            'Category tree retrieved successfully.'
        );
    }

    /**
     * Get category detail by slug.
     */
    public function show(string $slug): JsonResponse
    {
        $category = $this->categoryService->getCategoryBySlug($slug);

        if (!$category) {
            return ResponseHelper::notFound('Category not found.');
        }

        return ResponseHelper::success(
            new CategoryResource($category),
            'Category retrieved successfully.'
        );
    }

    /**
     * Get products in category.
     */
    public function products(Request $request, string $slug): JsonResponse
    {
        $perPage = PaginationHelper::getPerPage($request);
        $filters = $request->query('filter', []);
        if ($request->has('sort')) {
            $filters['sort'] = $request->query('sort');
        }

        $paginator = $this->categoryService->getProductsByCategorySlug($slug, $filters, $perPage);

        return ResponseHelper::paginated($paginator, ProductResource::class);
    }
}
