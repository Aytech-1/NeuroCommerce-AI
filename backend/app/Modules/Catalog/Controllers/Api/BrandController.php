<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Controllers\Api;

use App\Core\Helpers\PaginationHelper;
use App\Core\Helpers\ResponseHelper;
use App\Http\Controllers\Controller;
use App\Modules\Catalog\Resources\BrandResource;
use App\Modules\Catalog\Resources\ProductResource;
use App\Modules\Catalog\Services\BrandService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Class BrandController
 *
 * Public Storefront Brand API Controller
 *
 * @package App\Modules\Catalog\Controllers\Api
 */
class BrandController extends Controller
{
    public function __construct(
        protected BrandService $brandService
    ) {
    }

    /**
     * List all active brands.
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->query('per_page', 50);
        $paginator = $this->brandService->getActiveBrands($perPage);

        return ResponseHelper::paginated($paginator, BrandResource::class);
    }

    /**
     * Get brand detail by slug.
     */
    public function show(string $slug): JsonResponse
    {
        $brand = $this->brandService->getBrandBySlug($slug);

        if (!$brand) {
            return ResponseHelper::notFound('Brand not found.');
        }

        return ResponseHelper::success(
            new BrandResource($brand),
            'Brand retrieved successfully.'
        );
    }

    /**
     * Get products by brand slug.
     */
    public function products(Request $request, string $slug): JsonResponse
    {
        $perPage = PaginationHelper::getPerPage($request);
        $filters = $request->query('filter', []);
        if ($request->has('sort')) {
            $filters['sort'] = $request->query('sort');
        }

        $paginator = $this->brandService->getProductsByBrandSlug($slug, $filters, $perPage);

        return ResponseHelper::paginated($paginator, ProductResource::class);
    }
}
