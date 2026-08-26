<?php

declare(strict_types=1);

namespace App\Modules\Review\Controllers\Admin;

use App\Core\Helpers\PaginationHelper;
use App\Core\Helpers\ResponseHelper;
use App\Http\Controllers\Controller;
use App\Modules\Review\Requests\ReviewReplyRequest;
use App\Modules\Review\Resources\AdminReviewResource;
use App\Modules\Review\Services\ReviewService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Class ReviewController
 *
 * Admin endpoints for review moderation, featuring, replies, and management.
 *
 * @package App\Modules\Review\Controllers\Admin
 */
class ReviewController extends Controller
{
    use AuthorizesRequests;
    /**
     * ReviewController constructor.
     */
    public function __construct(
        protected ReviewService $reviewService
    ) {}

    /**
     * List all reviews with moderation filters.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', \App\Modules\Review\Models\Review::class);

        $perPage = PaginationHelper::getPerPage($request, 20);
        $filters = $request->only([
            'is_approved',
            'product_id',
            'user_id',
            'rating',
            'is_featured',
            'search',
        ]);

        $paginator = $this->reviewService->getAdminReviews($filters, $perPage);

        return ResponseHelper::paginated($paginator, AdminReviewResource::class, 'Reviews retrieved successfully.');
    }

    /**
     * Approve review.
     *
     * @param Request $request
     * @param string $id
     * @return JsonResponse
     */
    public function approve(Request $request, string $id): JsonResponse
    {
        $this->authorize('moderate', \App\Modules\Review\Models\Review::class);

        $review = $this->reviewService->approveReview($id);
        $review->load(['product', 'user']);

        return ResponseHelper::success(
            new AdminReviewResource($review),
            'Review approved successfully.'
        );
    }

    /**
     * Reject review.
     *
     * @param Request $request
     * @param string $id
     * @return JsonResponse
     */
    public function reject(Request $request, string $id): JsonResponse
    {
        $this->authorize('moderate', \App\Modules\Review\Models\Review::class);

        $review = $this->reviewService->rejectReview($id);
        $review->load(['product', 'user']);

        return ResponseHelper::success(
            new AdminReviewResource($review),
            'Review rejected successfully.'
        );
    }

    /**
     * Toggle featured status of review.
     *
     * @param Request $request
     * @param string $id
     * @return JsonResponse
     */
    public function feature(Request $request, string $id): JsonResponse
    {
        $this->authorize('moderate', \App\Modules\Review\Models\Review::class);

        $review = $this->reviewService->toggleFeatured($id);
        $review->load(['product', 'user']);

        return ResponseHelper::success(
            new AdminReviewResource($review),
            'Review featured status updated.'
        );
    }

    /**
     * Post/update store owner reply.
     *
     * @param ReviewReplyRequest $request
     * @param string $id
     * @return JsonResponse
     */
    public function reply(ReviewReplyRequest $request, string $id): JsonResponse
    {
        $this->authorize('moderate', \App\Modules\Review\Models\Review::class);

        $reply = (string) $request->validated('admin_reply');
        $review = $this->reviewService->addAdminReply($id, $reply);
        $review->load(['product', 'user']);

        return ResponseHelper::success(
            new AdminReviewResource($review),
            'Reply posted successfully.'
        );
    }

    /**
     * Delete review.
     *
     * @param Request $request
     * @param string $id
     * @return JsonResponse
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $this->authorize('delete', \App\Modules\Review\Models\Review::class);

        $this->reviewService->deleteReview($id, (string) $request->user()->id, true);

        return ResponseHelper::success(null, 'Review deleted successfully.');
    }
}
