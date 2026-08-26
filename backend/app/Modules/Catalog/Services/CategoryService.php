<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Services;

use App\Core\Abstracts\AbstractService;
use App\Modules\Catalog\Contracts\CategoryRepositoryInterface;
use App\Modules\Catalog\DTOs\CreateCategoryDTO;
use App\Modules\Catalog\DTOs\UpdateCategoryDTO;
use App\Modules\Catalog\Events\CategoryUpdated;
use App\Modules\Catalog\Models\Category;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Str;

/**
 * Class CategoryService
 *
 * @package App\Modules\Catalog\Services
 */
class CategoryService extends AbstractService
{
    public function __construct(
        protected CategoryRepositoryInterface $categoryRepository
    ) {
    }

    /**
     * Get full hierarchical category tree.
     */
    public function getCategoryTree(): Collection
    {
        return $this->categoryRepository->getTree();
    }

    /**
     * Get category by slug.
     */
    public function getCategoryBySlug(string $slug): ?Category
    {
        return $this->categoryRepository->findBySlug($slug);
    }

    /**
     * Get products by category slug.
     */
    public function getProductsByCategorySlug(string $slug, array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        return $this->categoryRepository->getPublicProducts($slug, $filters, $perPage);
    }

    /**
     * Create a category.
     */
    public function createCategory(CreateCategoryDTO $dto): Category
    {
        return $this->executeInTransaction(function () use ($dto) {
            $data = $dto->toArray();

            if (empty($data['slug'])) {
                $baseSlug = Str::slug($data['name']);
                $slug = $baseSlug;
                $counter = 1;
                while (Category::where('slug', $slug)->exists()) {
                    $slug = $baseSlug . '-' . $counter++;
                }
                $data['slug'] = $slug;
            }

            /** @var Category $category */
            $category = $this->categoryRepository->create($data);
            $this->dispatchDomainEvent(new CategoryUpdated($category));

            return $category;
        });
    }

    /**
     * Update an existing category.
     */
    public function updateCategory(string $id, UpdateCategoryDTO $dto): Category
    {
        return $this->executeInTransaction(function () use ($id, $dto) {
            $data = array_filter($dto->toArray(), fn ($v) => $v !== null);

            /** @var Category $category */
            $category = $this->categoryRepository->update($id, $data);
            $this->dispatchDomainEvent(new CategoryUpdated($category));

            return $category;
        });
    }

    /**
     * Delete a category.
     */
    public function deleteCategory(string $id): bool
    {
        return $this->executeInTransaction(function () use ($id) {
            $category = $this->categoryRepository->findById($id);
            if (!$category) {
                return false;
            }

            $deleted = $this->categoryRepository->delete($id);
            if ($deleted) {
                $this->dispatchDomainEvent(new CategoryUpdated($category));
            }

            return $deleted;
        });
    }

    /**
     * Reorder / rebuild category tree.
     */
    public function reorderTree(array $nodes): bool
    {
        return $this->categoryRepository->reorderTree($nodes);
    }
}
