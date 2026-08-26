<?php

declare(strict_types=1);

namespace App\Modules\CMS\Controllers\Admin;

use App\Core\Helpers\PaginationHelper;
use App\Core\Helpers\ResponseHelper;
use App\Http\Controllers\Controller;
use App\Modules\CMS\Models\Page;
use App\Modules\CMS\Requests\StoreBlogPostRequest;
use App\Modules\CMS\Requests\UpdateBlogPostRequest;
use App\Modules\CMS\Resources\AdminBlogPostResource;
use App\Modules\CMS\Services\BlogPostService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Class BlogPostController
 *
 * @package App\Modules\CMS\Controllers\Admin
 */
class BlogPostController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        protected readonly BlogPostService $blogPostService
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Page::class);

        $perPage = PaginationHelper::getPerPage($request, 20);
        $filters = $request->only(['status', 'category', 'search']);
        $posts = $this->blogPostService->paginateAdmin($filters, $perPage);

        return ResponseHelper::paginated($posts, AdminBlogPostResource::class);
    }

    public function store(StoreBlogPostRequest $request): JsonResponse
    {
        $this->authorize('create', Page::class);

        $post = $this->blogPostService->createPost($request->toDTO());

        return ResponseHelper::created(
            data: new AdminBlogPostResource($post),
            message: 'Blog post created successfully.'
        );
    }

    public function show(string $id): JsonResponse
    {
        $this->authorize('viewAny', Page::class);

        $post = $this->blogPostService->getById($id);

        return ResponseHelper::success(
            data: new AdminBlogPostResource($post),
            message: 'Blog post retrieved successfully.'
        );
    }

    public function update(UpdateBlogPostRequest $request, string $id): JsonResponse
    {
        $this->authorize('create', Page::class);

        $updated = $this->blogPostService->updatePost($id, $request->toDTO());

        return ResponseHelper::success(
            data: new AdminBlogPostResource($updated),
            message: 'Blog post updated successfully.'
        );
    }

    public function destroy(string $id): JsonResponse
    {
        $this->authorize('create', Page::class);

        $this->blogPostService->deletePost($id);

        return ResponseHelper::success(
            data: null,
            message: 'Blog post deleted successfully.'
        );
    }
}
