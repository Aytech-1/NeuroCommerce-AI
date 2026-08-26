<?php

declare(strict_types=1);

namespace App\Modules\CMS\Controllers\Admin;

use App\Core\Helpers\PaginationHelper;
use App\Core\Helpers\ResponseHelper;
use App\Http\Controllers\Controller;
use App\Modules\CMS\Models\Faq;
use App\Modules\CMS\Requests\StoreFaqRequest;
use App\Modules\CMS\Requests\UpdateFaqRequest;
use App\Modules\CMS\Resources\FaqResource;
use App\Modules\CMS\Services\CmsContentService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Class FaqController
 *
 * @package App\Modules\CMS\Controllers\Admin
 */
class FaqController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        protected readonly CmsContentService $cmsContentService
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Faq::class);

        $perPage = PaginationHelper::getPerPage($request, 20);
        $filters = $request->only(['is_active', 'category', 'search']);
        $faqs = $this->cmsContentService->paginateFaqsAdmin($filters, $perPage);

        return ResponseHelper::paginated($faqs, FaqResource::class);
    }

    public function store(StoreFaqRequest $request): JsonResponse
    {
        $this->authorize('create', Faq::class);

        $faq = $this->cmsContentService->createFaq($request->toDTO());

        return ResponseHelper::created(
            data: new FaqResource($faq),
            message: 'FAQ created successfully.'
        );
    }

    public function show(string $id): JsonResponse
    {
        $faq = $this->cmsContentService->getFaqById($id);
        $this->authorize('view', $faq);

        return ResponseHelper::success(
            data: new FaqResource($faq),
            message: 'FAQ retrieved successfully.'
        );
    }

    public function update(UpdateFaqRequest $request, string $id): JsonResponse
    {
        $faq = $this->cmsContentService->getFaqById($id);
        $this->authorize('update', $faq);

        $updated = $this->cmsContentService->updateFaq($id, $request->toDTO());

        return ResponseHelper::success(
            data: new FaqResource($updated),
            message: 'FAQ updated successfully.'
        );
    }

    public function destroy(string $id): JsonResponse
    {
        $faq = $this->cmsContentService->getFaqById($id);
        $this->authorize('delete', $faq);

        $this->cmsContentService->deleteFaq($id);

        return ResponseHelper::success(
            data: null,
            message: 'FAQ deleted successfully.'
        );
    }
}
