<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Controllers\Admin;

use App\Core\Helpers\PaginationHelper;
use App\Core\Helpers\ResponseHelper;
use App\Http\Controllers\Controller;
use App\Modules\Catalog\Models\Brand;
use App\Modules\Catalog\Requests\StoreBrandRequest;
use App\Modules\Catalog\Requests\UpdateBrandRequest;
use App\Modules\Catalog\Resources\BrandResource;
use App\Modules\Catalog\Services\BrandService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

/**
 * Class BrandController
 *
 * Admin Backoffice Brand Management API Controller
 *
 * @package App\Modules\Catalog\Controllers\Admin
 */
class BrandController extends Controller
{
    public function __construct(
        protected BrandService $brandService
    ) {
    }

    /**
     * List all brands (admin view).
     */
    public function index(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', Brand::class);

        $perPage = PaginationHelper::getPerPage($request);
        $paginator = $this->brandService->getAllBrands([], $perPage);

        return ResponseHelper::paginated($paginator, BrandResource::class);
    }

    /**
     * Create brand.
     */
    public function store(StoreBrandRequest $request): JsonResponse
    {
        Gate::authorize('create', Brand::class);

        $dto = $request->toDTO();
        $brand = $this->brandService->createBrand($dto);

        return ResponseHelper::created(
            new BrandResource($brand),
            'Brand created successfully.'
        );
    }

    /**
     * Update brand.
     */
    public function update(UpdateBrandRequest $request, string $id): JsonResponse
    {
        $brand = $this->brandService->getBrandById($id);
        if (!$brand) {
            return ResponseHelper::notFound('Brand not found.');
        }

        Gate::authorize('update', $brand);

        $dto = $request->toDTO();
        $updated = $this->brandService->updateBrand($id, $dto);

        return ResponseHelper::success(
            new BrandResource($updated),
            'Brand updated successfully.'
        );
    }

    /**
     * Delete brand.
     */
    public function destroy(string $id): JsonResponse
    {
        $brand = $this->brandService->getBrandById($id);
        if (!$brand) {
            return ResponseHelper::notFound('Brand not found.');
        }

        Gate::authorize('delete', $brand);

        $this->brandService->deleteBrand($id);

        return ResponseHelper::success(null, 'Brand deleted successfully.');
    }
}
