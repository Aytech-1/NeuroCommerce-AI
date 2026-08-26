<?php

declare(strict_types=1);

namespace App\Modules\CMS\Controllers\Api;

use App\Core\Helpers\PaginationHelper;
use App\Core\Helpers\ResponseHelper;
use App\Http\Controllers\Controller;
use App\Modules\CMS\Resources\PageResource;
use App\Modules\CMS\Services\PageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Class PublicPageController
 *
 * @package App\Modules\CMS\Controllers\Api
 */
class PublicPageController extends Controller
{
    public function __construct(
        protected readonly PageService $pageService
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $perPage = PaginationHelper::getPerPage($request, 20);
        $pages = $this->pageService->getPublishedPages($perPage);

        return ResponseHelper::paginated($pages, PageResource::class);
    }

    public function show(string $slug): JsonResponse
    {
        $page = $this->pageService->getPublishedBySlug($slug);

        return ResponseHelper::success(
            data: new PageResource($page),
            message: 'Page retrieved successfully.'
        );
    }
}
