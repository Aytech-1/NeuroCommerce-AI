<?php

declare(strict_types=1);

namespace App\Modules\Admin\Services;

use App\Core\Abstracts\AbstractService;
use App\Modules\Admin\Contracts\ReportRepositoryInterface;
use App\Modules\Admin\DTOs\GenerateReportDTO;
use App\Modules\Admin\Enums\ReportFormat;
use App\Modules\Admin\Enums\ReportType;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Class ReportService
 *
 * @package App\Modules\Admin\Services
 */
class ReportService extends AbstractService
{
    public function __construct(
        protected readonly ReportRepositoryInterface $reportRepository
    ) {
    }

    public function exportOrders(GenerateReportDTO $dto): StreamedResponse|array
    {
        Log::info('[ReportService] Generating orders export for user: ' . ($dto->requestedByUserId ?? 'system'));

        if ($dto->format === ReportFormat::JSON->value) {
            $cursor = $this->reportRepository->getOrdersReportCursor($dto->startDate, $dto->endDate, $dto->filters ?? []);
            return $cursor->toArray();
        }

        // Stream CSV directly using LazyCollection cursor to prevent memory exhaustion (OOM)
        $cursor = $this->reportRepository->getOrdersReportCursor($dto->startDate, $dto->endDate, $dto->filters ?? []);

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="orders-report-' . now()->format('YmdHis') . '.csv"',
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        return response()->stream(function () use ($cursor) {
            $handle = fopen('php://output', 'w');

            // Write CSV headers
            fputcsv($handle, [
                'Order Number',
                'Customer Email',
                'Status',
                'Currency',
                'Subtotal',
                'Tax Total',
                'Shipping Total',
                'Discount Total',
                'Grand Total',
                'Items Count',
                'Created At',
            ]);

            foreach ($cursor as $order) {
                fputcsv($handle, [
                    $order->order_number,
                    $order->user ? $order->user->email : $order->guest_email,
                    $order->status instanceof \BackedEnum ? $order->status->value : $order->status,
                    $order->currency_code,
                    $order->subtotal,
                    $order->tax_amount,
                    $order->shipping_amount,
                    $order->discount_amount,
                    $order->total_amount,
                    $order->items->count(),
                    $order->created_at->toIso8601String(),
                ]);
            }

            fclose($handle);
        }, 200, $headers);
    }

    public function exportTaxSummary(GenerateReportDTO $dto): array
    {
        return $this->reportRepository->getTaxSummaryReport($dto->startDate, $dto->endDate);
    }

    public function exportInventoryValuation(): array
    {
        return $this->reportRepository->getInventoryValuationReport();
    }
}
