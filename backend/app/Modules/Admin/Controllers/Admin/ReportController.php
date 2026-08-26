<?php

declare(strict_types=1);

namespace App\Modules\Admin\Controllers\Admin;

use App\Core\Helpers\ResponseHelper;
use App\Http\Controllers\Controller;
use App\Modules\Admin\Models\AnalyticsDailySales;
use App\Modules\Admin\Requests\GenerateReportRequest;
use App\Modules\Admin\Services\ReportService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Class ReportController
 *
 * @package App\Modules\Admin\Controllers\Admin
 */
class ReportController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        protected readonly ReportService $reportService
    ) {
    }

    public function exportOrders(GenerateReportRequest $request): StreamedResponse|JsonResponse
    {
        $this->authorize('generate', AnalyticsDailySales::class);

        $dto = $request->toDTO();
        $result = $this->reportService->exportOrders($dto);

        if ($result instanceof StreamedResponse) {
            return $result;
        }

        return ResponseHelper::success(
            data: $result,
            message: 'Orders report generated successfully.'
        );
    }

    public function exportTax(GenerateReportRequest $request): JsonResponse
    {
        $this->authorize('generate', AnalyticsDailySales::class);

        $dto = $request->toDTO();
        $data = $this->reportService->exportTaxSummary($dto);

        return ResponseHelper::success(
            data: $data,
            message: 'Tax summary report generated successfully.'
        );
    }

    public function exportInventory(GenerateReportRequest $request): JsonResponse
    {
        $this->authorize('generate', AnalyticsDailySales::class);

        $data = $this->reportService->exportInventoryValuation();

        return ResponseHelper::success(
            data: $data,
            message: 'Inventory valuation report generated successfully.'
        );
    }
}
