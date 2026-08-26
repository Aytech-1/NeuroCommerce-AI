<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Controllers\Admin;

use App\Core\Helpers\ResponseHelper;
use App\Http\Controllers\Controller;
use App\Modules\Catalog\Models\Category;
use App\Modules\Catalog\Requests\ReorderCategoriesRequest;
use App\Modules\Catalog\Requests\StoreCategoryRequest;
use App\Modules\Catalog\Requests\UpdateCategoryRequest;
use App\Modules\Catalog\Resources\CategoryResource;
use App\Modules\Catalog\Services\CategoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;

/**
 * Class CategoryController
 *
 * Admin Backoffice Category Management API Controller
 *
 * @package App\Modules\Catalog\Controllers\Admin
 */
class CategoryController extends Controller
{
    public function __construct(
        protected CategoryService $categoryService
    ) {
    }

    /**
     * List all categories (tree).
     */
    public function index(): JsonResponse
    {
        Gate::authorize('viewAny', Category::class);

        $tree = $this->categoryService->getCategoryTree();

        return ResponseHelper::success(
            CategoryResource::collection($tree),
            'Categories retrieved successfully.'
        );
    }

    /**
     * Create category.
     */
    public function store(StoreCategoryRequest $request): JsonResponse
    {
        Gate::authorize('create', Category::class);

        $dto = $request->toDTO();
        $category = $this->categoryService->createCategory($dto);

        return ResponseHelper::created(
            new CategoryResource($category),
            'Category created successfully.'
        );
    }

    /**
     * Update category.
     */
    public function update(UpdateCategoryRequest $request, string $id): JsonResponse
    {
        $category = Category::find($id);
        if (!$category) {
            return ResponseHelper::notFound('Category not found.');
        }

        Gate::authorize('update', $category);

        $dto = $request->toDTO();
        $updated = $this->categoryService->updateCategory($id, $dto);

        return ResponseHelper::success(
            new CategoryResource($updated),
            'Category updated successfully.'
        );
    }

    /**
     * Delete category.
     */
    public function destroy(string $id): JsonResponse
    {
        $category = Category::find($id);
        if (!$category) {
            return ResponseHelper::notFound('Category not found.');
        }

        Gate::authorize('delete', $category);

        $this->categoryService->deleteCategory($id);

        return ResponseHelper::success(null, 'Category deleted successfully.');
    }

    /**
     * Reorder categories.
     */
    public function reorder(ReorderCategoriesRequest $request): JsonResponse
    {
        Gate::authorize('create', Category::class);

        $nodes = $request->validated('categories');
        $this->categoryService->reorderTree($nodes);

        return ResponseHelper::success(null, 'Categories reordered successfully.');
    }
}
