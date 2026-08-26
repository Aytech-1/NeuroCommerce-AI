<?php

declare(strict_types=1);

namespace App\Modules\CMS\Controllers\Admin;

use App\Core\Helpers\PaginationHelper;
use App\Core\Helpers\ResponseHelper;
use App\Http\Controllers\Controller;
use App\Modules\CMS\Models\Banner;
use App\Modules\CMS\Requests\StoreBannerRequest;
use App\Modules\CMS\Requests\UpdateBannerRequest;
use App\Modules\CMS\Resources\BannerResource;
use App\Modules\CMS\Services\CmsContentService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Class BannerController
 *
 * @package App\Modules\CMS\Controllers\Admin
 */
class BannerController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        protected readonly CmsContentService $cmsContentService
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Banner::class);

        $perPage = PaginationHelper::getPerPage($request, 20);
        $filters = $request->only(['is_active', 'position', 'search']);
        $banners = $this->cmsContentService->paginateBannersAdmin($filters, $perPage);

        return ResponseHelper::paginated($banners, BannerResource::class);
    }

    public function store(StoreBannerRequest $request): JsonResponse
    {
        $this->authorize('create', Banner::class);

        $banner = $this->cmsContentService->createBanner($request->toDTO());

        return ResponseHelper::created(
            data: new BannerResource($banner),
            message: 'Banner created successfully.'
        );
    }

    public function show(string $id): JsonResponse
    {
        $banner = $this->cmsContentService->getBannerById($id);
        $this->authorize('view', $banner);

        return ResponseHelper::success(
            data: new BannerResource($banner),
            message: 'Banner retrieved successfully.'
        );
    }

    public function update(UpdateBannerRequest $request, string $id): JsonResponse
    {
        $banner = $this->cmsContentService->getBannerById($id);
        $this->authorize('update', $banner);

        $updated = $this->cmsContentService->updateBanner($id, $request->toDTO());

        return ResponseHelper::success(
            data: new BannerResource($updated),
            message: 'Banner updated successfully.'
        );
    }

    public function destroy(string $id): JsonResponse
    {
        $banner = $this->cmsContentService->getBannerById($id);
        $this->authorize('delete', $banner);

        $this->cmsContentService->deleteBanner($id);

        return ResponseHelper::success(
            data: null,
            message: 'Banner deleted successfully.'
        );
    }
}
