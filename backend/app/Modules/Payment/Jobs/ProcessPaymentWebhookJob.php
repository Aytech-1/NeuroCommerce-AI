<?php

declare(strict_types=1);

namespace App\Modules\Payment\Jobs;

use App\Modules\Payment\Services\WebhookService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Http\Request;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

/**
 * Class ProcessPaymentWebhookJob
 *
 * @package App\Modules\Payment\Jobs
 */
class ProcessPaymentWebhookJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public int $tries = 3;
    public array $backoff = [5, 30, 120];

    public function __construct(
        public readonly string $provider,
        public readonly array $headers,
        public readonly string $rawPayload
    ) {
        $this->onQueue('payments');
    }

    public function handle(WebhookService $webhookService): void
    {
        $request = Request::create(
            uri: "/api/v1/webhooks/{$this->provider}",
            method: 'POST',
            content: $this->rawPayload
        );

        foreach ($this->headers as $key => $value) {
            $request->headers->set((string) $key, (string) (is_array($value) ? $value[0] : $value));
        }

        try {
            $webhookService->handleWebhook($this->provider, $request);
        } catch (\Throwable $e) {
            Log::error("Failed processing payment webhook asynchronously for {$this->provider}: " . $e->getMessage(), [
                'exception' => $e,
            ]);
            throw $e;
        }
    }
}
