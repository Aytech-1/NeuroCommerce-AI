<?php

declare(strict_types=1);

namespace App\Modules\CMS\Controllers\Api;

use App\Core\Helpers\PaginationHelper;
use App\Core\Helpers\ResponseHelper;
use App\Http\Controllers\Controller;
use App\Modules\CMS\Resources\BlogPostResource;
use App\Modules\CMS\Services\BlogPostService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Class PublicBlogController
 *
 * @package App\Modules\CMS\Controllers\Api
 */
class PublicBlogController extends Controller
{
    public function __construct(
        protected readonly BlogPostService $blogPostService
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $perPage = PaginationHelper::getPerPage($request, 10);
        $filters = $request->only(['category', 'is_featured']);
        $posts = $this->blogPostService->getPublishedPosts($filters, $perPage);

        return ResponseHelper::paginated($posts, BlogPostResource::class);
    }

    public function show(string $slug): JsonResponse
    {
        $post = $this->blogPostService->getPublishedBySlug($slug);

        return ResponseHelper::success(
            data: new BlogPostResource($post),
            message: 'Blog post retrieved successfully.'
        );
    }
}
