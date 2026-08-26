<?php

declare(strict_types=1);

namespace App\Modules\Notification\Jobs;

use App\Modules\Notification\DTOs\SendNotificationDTO;
use App\Modules\Notification\Services\NotificationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

/**
 * Class DispatchNotificationJob
 *
 * @package App\Modules\Notification\Jobs
 */
class DispatchNotificationJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public int $tries = 3;
    public array $backoff = [5, 15, 60];

    public function __construct(
        public readonly SendNotificationDTO $dto
    ) {
    }

    public function handle(NotificationService $notificationService): void
    {
        $delivered = $notificationService->deliver($this->dto);

        if (!$delivered) {
            Log::warning("[DispatchNotificationJob] Notification delivery attempt returned false for user {$this->dto->userId}");
        }
    }

    public function failed(\Throwable $exception): void
    {
        Log::error("[DispatchNotificationJob] Job permanently failed for user {$this->dto->userId}: " . $exception->getMessage(), [
            'exception' => $exception,
            'dto' => $this->dto,
        ]);
    }
}
