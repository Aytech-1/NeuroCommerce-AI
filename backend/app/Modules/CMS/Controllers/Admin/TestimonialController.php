<?php

declare(strict_types=1);

namespace App\Modules\CMS\Controllers\Admin;

use App\Core\Helpers\PaginationHelper;
use App\Core\Helpers\ResponseHelper;
use App\Http\Controllers\Controller;
use App\Modules\CMS\Models\Testimonial;
use App\Modules\CMS\Requests\StoreTestimonialRequest;
use App\Modules\CMS\Requests\UpdateTestimonialRequest;
use App\Modules\CMS\Resources\TestimonialResource;
use App\Modules\CMS\Services\CmsContentService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Class TestimonialController
 *
 * @package App\Modules\CMS\Controllers\Admin
 */
class TestimonialController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        protected readonly CmsContentService $cmsContentService
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Testimonial::class);

        $perPage = PaginationHelper::getPerPage($request, 20);
        $filters = $request->only(['is_active', 'search']);
        $testimonials = $this->cmsContentService->paginateTestimonialsAdmin($filters, $perPage);

        return ResponseHelper::paginated($testimonials, TestimonialResource::class);
    }

    public function store(StoreTestimonialRequest $request): JsonResponse
    {
        $this->authorize('create', Testimonial::class);

        $testimonial = $this->cmsContentService->createTestimonial($request->toDTO());

        return ResponseHelper::created(
            data: new TestimonialResource($testimonial),
            message: 'Testimonial created successfully.'
        );
    }

    public function show(string $id): JsonResponse
    {
        $testimonial = $this->cmsContentService->getTestimonialById($id);
        $this->authorize('view', $testimonial);

        return ResponseHelper::success(
            data: new TestimonialResource($testimonial),
            message: 'Testimonial retrieved successfully.'
        );
    }

    public function update(UpdateTestimonialRequest $request, string $id): JsonResponse
    {
        $testimonial = $this->cmsContentService->getTestimonialById($id);
        $this->authorize('update', $testimonial);

        $updated = $this->cmsContentService->updateTestimonial($id, $request->toDTO());

        return ResponseHelper::success(
            data: new TestimonialResource($updated),
            message: 'Testimonial updated successfully.'
        );
    }

    public function destroy(string $id): JsonResponse
    {
        $testimonial = $this->cmsContentService->getTestimonialById($id);
        $this->authorize('delete', $testimonial);

        $this->cmsContentService->deleteTestimonial($id);

        return ResponseHelper::success(
            data: null,
            message: 'Testimonial deleted successfully.'
        );
    }
}
