<?php

declare(strict_types=1);

namespace App\Modules\CMS\Controllers\Admin;

use App\Core\Helpers\PaginationHelper;
use App\Core\Helpers\ResponseHelper;
use App\Http\Controllers\Controller;
use App\Modules\CMS\Models\Page;
use App\Modules\CMS\Requests\StorePageRequest;
use App\Modules\CMS\Requests\UpdatePageRequest;
use App\Modules\CMS\Resources\AdminPageResource;
use App\Modules\CMS\Services\PageService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Class PageController
 *
 * @package App\Modules\CMS\Controllers\Admin
 */
class PageController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        protected readonly PageService $pageService
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Page::class);

        $perPage = PaginationHelper::getPerPage($request, 20);
        $filters = $request->only(['status', 'search']);
        $pages = $this->pageService->paginateAdmin($filters, $perPage);

        return ResponseHelper::paginated($pages, AdminPageResource::class);
    }

    public function store(StorePageRequest $request): JsonResponse
    {
        $this->authorize('create', Page::class);

        $page = $this->pageService->createPage($request->toDTO());

        return ResponseHelper::created(
            data: new AdminPageResource($page),
            message: 'Page created successfully.'
        );
    }

    public function show(string $id): JsonResponse
    {
        $page = $this->pageService->getById($id);
        $this->authorize('view', $page);

        return ResponseHelper::success(
            data: new AdminPageResource($page),
            message: 'Page retrieved successfully.'
        );
    }

    public function update(UpdatePageRequest $request, string $id): JsonResponse
    {
        $page = $this->pageService->getById($id);
        $this->authorize('update', $page);

        $updated = $this->pageService->updatePage($id, $request->toDTO());

        return ResponseHelper::success(
            data: new AdminPageResource($updated),
            message: 'Page updated successfully.'
        );
    }

    public function destroy(string $id): JsonResponse
    {
        $page = $this->pageService->getById($id);
        $this->authorize('delete', $page);

        $this->pageService->deletePage($id);

        return ResponseHelper::success(
            data: null,
            message: 'Page deleted successfully.'
        );
    }

    public function publish(string $id): JsonResponse
    {
        $page = $this->pageService->getById($id);
        $this->authorize('publish', $page);

        $updated = $this->pageService->togglePublish($id);

        return ResponseHelper::success(
            data: new AdminPageResource($updated),
            message: 'Page publication status toggled successfully.'
        );
    }
}
