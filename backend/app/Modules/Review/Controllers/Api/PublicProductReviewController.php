<?php

declare(strict_types=1);

namespace App\Modules\Review\Controllers\Api;

use App\Core\Helpers\PaginationHelper;
use App\Core\Helpers\ResponseHelper;
use App\Http\Controllers\Controller;
use App\Modules\Review\Resources\ReviewResource;
use App\Modules\Review\Services\ReviewService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Class PublicProductReviewController
 *
 * Public endpoints for product reviews.
 *
 * @package App\Modules\Review\Controllers\Api
 */
class PublicProductReviewController extends Controller
{
    /**
     * PublicProductReviewController constructor.
     */
    public function __construct(
        protected ReviewService $reviewService
    ) {}

    /**
     * List approved reviews for a product.
     *
     * @param Request $request
     * @param string $id
     * @return JsonResponse
     */
    public function index(Request $request, string $id): JsonResponse
    {
        $perPage = PaginationHelper::getPerPage($request, 20);
        $filters = [
            'rating' => $request->query('rating'),
            'is_verified_purchase' => $request->query('is_verified_purchase'),
        ];
        $sortBy = (string) $request->query('sort', 'created_at');
        $sortDir = (string) $request->query('direction', 'desc');

        $paginator = $this->reviewService->getProductReviews($id, $filters, $perPage, $sortBy, $sortDir);

        return ResponseHelper::paginated($paginator, ReviewResource::class, 'Product reviews retrieved successfully.');
    }
}
