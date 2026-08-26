<?php

declare(strict_types=1);

namespace App\Modules\Payment\Controllers\Api;

use App\Core\Helpers\ResponseHelper;
use App\Http\Controllers\Controller;
use App\Modules\Payment\Services\WebhookService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Class WebhookController
 *
 * Handles asynchronous server-to-server webhook ingestion for payment gateways.
 *
 * @package App\Modules\Payment\Controllers\Api
 */
class WebhookController extends Controller
{
    public function __construct(
        private readonly WebhookService $webhookService
    ) {
    }

    public function handle(string $provider, Request $request): JsonResponse
    {
        $result = $this->webhookService->handleWebhook($provider, $request);

        return ResponseHelper::success(
            data: $result,
            message: $result['message'] ?? 'Webhook received successfully.'
        );
    }
}
