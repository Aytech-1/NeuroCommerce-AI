<?php

declare(strict_types=1);

namespace App\Modules\Review\Controllers\Api;

use App\Core\Helpers\PaginationHelper;
use App\Core\Helpers\ResponseHelper;
use App\Http\Controllers\Controller;
use App\Modules\Review\DTOs\CreateReviewDTO;
use App\Modules\Review\DTOs\UpdateReviewDTO;
use App\Modules\Review\Enums\ReviewVoteType;
use App\Modules\Review\Requests\StoreReviewRequest;
use App\Modules\Review\Requests\UpdateReviewRequest;
use App\Modules\Review\Requests\VoteReviewRequest;
use App\Modules\Review\Resources\ReviewResource;
use App\Modules\Review\Resources\ReviewVoteResource;
use App\Modules\Review\Services\ReviewService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Class CustomerReviewController
 *
 * Customer authenticated endpoints for reviews and voting.
 *
 * @package App\Modules\Review\Controllers\Api
 */
class CustomerReviewController extends Controller
{
    /**
     * CustomerReviewController constructor.
     */
    public function __construct(
        protected ReviewService $reviewService
    ) {}

    /**
     * List customer's own reviews.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $userId = (string) $request->user()->id;
        $perPage = PaginationHelper::getPerPage($request, 20);

        $paginator = $this->reviewService->getCustomerReviews($userId, $perPage);

        return ResponseHelper::paginated($paginator, ReviewResource::class, 'Customer reviews retrieved successfully.');
    }

    /**
     * Submit a product review.
     *
     * @param StoreReviewRequest $request
     * @param string $id Product ID
     * @return JsonResponse
     */
    public function store(StoreReviewRequest $request, string $id): JsonResponse
    {
        $userId = (string) $request->user()->id;

        $dto = new CreateReviewDTO(
            productId: $id,
            userId: $userId,
            rating: (int) $request->validated('rating'),
            title: $request->validated('title'),
            body: $request->validated('body'),
            images: $request->validated('images')
        );

        $review = $this->reviewService->submitReview($dto);
        $review->load(['product', 'user']);

        return ResponseHelper::created(
            new ReviewResource($review),
            'Review submitted successfully. It will be published after moderation.'
        );
    }

    /**
     * Update customer's own review.
     *
     * @param UpdateReviewRequest $request
     * @param string $id Review ID
     * @return JsonResponse
     */
    public function update(UpdateReviewRequest $request, string $id): JsonResponse
    {
        $userId = (string) $request->user()->id;

        $dto = new UpdateReviewDTO(
            rating: $request->has('rating') ? (int) $request->validated('rating') : null,
            title: $request->has('title') ? $request->validated('title') : null,
            body: $request->has('body') ? $request->validated('body') : null,
            images: $request->has('images') ? $request->validated('images') : null
        );

        $review = $this->reviewService->updateReview($id, $userId, $dto);
        $review->load(['product', 'user']);

        return ResponseHelper::success(
            new ReviewResource($review),
            'Review updated successfully.'
        );
    }

    /**
     * Delete customer's own review.
     *
     * @param Request $request
     * @param string $id Review ID
     * @return JsonResponse
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $userId = (string) $request->user()->id;

        $this->reviewService->deleteReview($id, $userId, false);

        return ResponseHelper::success(null, 'Review deleted successfully.');
    }

    /**
     * Vote on review helpfulness.
     *
     * @param VoteReviewRequest $request
     * @param string $id Review ID
     * @return JsonResponse
     */
    public function vote(VoteReviewRequest $request, string $id): JsonResponse
    {
        $userId = (string) $request->user()->id;
        $voteType = ReviewVoteType::from((string) $request->validated('vote'));

        $vote = $this->reviewService->voteReview($id, $userId, $voteType);

        return ResponseHelper::success(
            new ReviewVoteResource($vote),
            'Vote recorded successfully.'
        );
    }
}
