<?php

declare(strict_types=1);

namespace App\Modules\Order\Controllers\Admin;

use App\Core\Helpers\PaginationHelper;
use App\Core\Helpers\ResponseHelper;
use App\Http\Controllers\Controller;
use App\Modules\Order\Contracts\InvoiceRepositoryInterface;
use App\Modules\Order\Models\Invoice;
use App\Modules\Order\Resources\InvoiceResource;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Class InvoiceController
 *
 * Admin controller for commercial invoicing and financial document inspection.
 *
 * @package App\Modules\Order\Controllers\Admin
 */
class InvoiceController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private readonly InvoiceRepositoryInterface $invoiceRepository
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $perPage = PaginationHelper::getPerPage($request);
        $filters = $request->only(['status', 'currency_code', 'search']);

        $paginator = $this->invoiceRepository->paginateForAdmin($filters, $perPage);

        return ResponseHelper::paginated($paginator, InvoiceResource::class);
    }

    public function show(string $id): JsonResponse
    {
        /** @var Invoice $invoice */
        $invoice = Invoice::with([
            'order.user',
            'order.items',
            'order.billingAddress',
            'order.shippingAddress',
        ])->findOrFail($id);

        return ResponseHelper::success(new InvoiceResource($invoice));
    }
}
