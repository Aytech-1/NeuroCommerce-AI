<?php

declare(strict_types=1);

namespace App\Modules\CMS\Controllers\Api;

use App\Core\Helpers\ResponseHelper;
use App\Http\Controllers\Controller;
use App\Modules\CMS\Requests\ContactFormRequest;
use App\Modules\CMS\Resources\BannerResource;
use App\Modules\CMS\Resources\CmsHomepageResource;
use App\Modules\CMS\Resources\FaqResource;
use App\Modules\CMS\Resources\TestimonialResource;
use App\Modules\CMS\Services\CmsContentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Class PublicCmsController
 *
 * @package App\Modules\CMS\Controllers\Api
 */
class PublicCmsController extends Controller
{
    public function __construct(
        protected readonly CmsContentService $cmsContentService
    ) {
    }

    public function homepage(Request $request): JsonResponse
    {
        $content = $this->cmsContentService->getHomepageContent();

        return ResponseHelper::success(
            data: new CmsHomepageResource($content),
            message: 'Homepage content retrieved successfully.'
        );
    }

    public function banners(Request $request): JsonResponse
    {
        $position = $request->has('position') ? (string) $request->input('position') : null;
        $banners = $this->cmsContentService->getActiveBanners($position);

        return ResponseHelper::success(
            data: BannerResource::collection($banners),
            message: 'Banners retrieved successfully.'
        );
    }

    public function faqs(Request $request): JsonResponse
    {
        $category = $request->has('category') ? (string) $request->input('category') : null;
        $faqs = $this->cmsContentService->getActiveFaqs($category);

        return ResponseHelper::success(
            data: FaqResource::collection($faqs),
            message: 'FAQs retrieved successfully.'
        );
    }

    public function testimonials(Request $request): JsonResponse
    {
        $testimonials = $this->cmsContentService->getActiveTestimonials();

        return ResponseHelper::success(
            data: TestimonialResource::collection($testimonials),
            message: 'Testimonials retrieved successfully.'
        );
    }

    public function contact(ContactFormRequest $request): JsonResponse
    {
        $this->cmsContentService->processContactMessage($request->toDTO());

        return ResponseHelper::success(
            data: null,
            message: 'Thank you for your message. We will get back to you shortly.'
        );
    }

    public function navigation(Request $request): JsonResponse
    {
        $navigation = $this->cmsContentService->getNavigation();

        return ResponseHelper::success(
            data: $navigation,
            message: 'Navigation retrieved successfully.'
        );
    }
}
