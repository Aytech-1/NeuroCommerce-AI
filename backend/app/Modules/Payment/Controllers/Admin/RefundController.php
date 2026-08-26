<?php

declare(strict_types=1);

namespace App\Modules\Payment\Controllers\Admin;

use App\Core\Helpers\PaginationHelper;
use App\Core\Helpers\ResponseHelper;
use App\Http\Controllers\Controller;
use App\Modules\Payment\Models\Refund;
use App\Modules\Payment\Resources\RefundResource;
use App\Modules\Payment\Services\RefundService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Class RefundController
 *
 * @package App\Modules\Payment\Controllers\Admin
 */
class RefundController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private readonly RefundService $refundService
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Refund::class);

        $perPage = PaginationHelper::getPerPage($request);
        $filters = $request->only(['status', 'order_id']);

        $paginator = $this->refundService->paginateRefunds($filters, $perPage);

        return ResponseHelper::paginated($paginator, RefundResource::class);
    }
}
