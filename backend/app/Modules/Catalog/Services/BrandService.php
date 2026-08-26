<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Services;

use App\Core\Abstracts\AbstractService;
use App\Modules\Catalog\Contracts\BrandRepositoryInterface;
use App\Modules\Catalog\DTOs\CreateBrandDTO;
use App\Modules\Catalog\DTOs\UpdateBrandDTO;
use App\Modules\Catalog\Models\Brand;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;

/**
 * Class BrandService
 *
 * @package App\Modules\Catalog\Services
 */
class BrandService extends AbstractService
{
    public function __construct(
        protected BrandRepositoryInterface $brandRepository
    ) {
    }

    /**
     * Get active brands for public storefront.
     */
    public function getActiveBrands(int $perPage = 50): LengthAwarePaginator
    {
        return $this->brandRepository->getActive($perPage);
    }

    /**
     * Get all brands paginated for admin.
     */
    public function getAllBrands(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        return $this->brandRepository->findAll($filters, $perPage);
    }

    /**
     * Get brand by slug.
     */
    public function getBrandBySlug(string $slug): ?Brand
    {
        return $this->brandRepository->findBySlug($slug);
    }

    /**
     * Get brand by ID.
     */
    public function getBrandById(string $id): ?Brand
    {
        return $this->brandRepository->findById($id);
    }

    /**
     * Get public products by brand slug.
     */
    public function getProductsByBrandSlug(string $slug, array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        return $this->brandRepository->getPublicProducts($slug, $filters, $perPage);
    }

    /**
     * Create brand.
     */
    public function createBrand(CreateBrandDTO $dto): Brand
    {
        return $this->executeInTransaction(function () use ($dto) {
            $data = $dto->toArray();

            if (empty($data['slug'])) {
                $baseSlug = Str::slug($data['name']);
                $slug = $baseSlug;
                $counter = 1;
                while (Brand::where('slug', $slug)->exists()) {
                    $slug = $baseSlug . '-' . $counter++;
                }
                $data['slug'] = $slug;
            }

            /** @var Brand $brand */
            $brand = $this->brandRepository->create($data);

            return $brand;
        });
    }

    /**
     * Update brand.
     */
    public function updateBrand(string $id, UpdateBrandDTO $dto): Brand
    {
        return $this->executeInTransaction(function () use ($id, $dto) {
            $data = array_filter($dto->toArray(), fn ($v) => $v !== null);

            /** @var Brand $brand */
            $brand = $this->brandRepository->update($id, $data);

            return $brand;
        });
    }

    /**
     * Delete brand.
     */
    public function deleteBrand(string $id): bool
    {
        return $this->brandRepository->delete($id);
    }
}
