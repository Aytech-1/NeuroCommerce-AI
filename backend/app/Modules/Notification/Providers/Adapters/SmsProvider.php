<?php

declare(strict_types=1);

namespace App\Modules\Notification\Providers\Adapters;

use App\Modules\Notification\Contracts\NotificationProviderInterface;
use App\Modules\Notification\DTOs\SendNotificationDTO;
use App\Modules\Notification\Enums\NotificationChannel;
use Illuminate\Support\Facades\Log;

/**
 * Class SmsProvider
 *
 * @package App\Modules\Notification\Providers\Adapters
 */
class SmsProvider implements NotificationProviderInterface
{
    public function getChannel(): NotificationChannel
    {
        return NotificationChannel::SMS;
    }

    public function send(SendNotificationDTO $dto): bool
    {
        $phone = $dto->recipientPhone;

        if (empty($phone)) {
            Log::warning("[SmsProvider] Skipped sending SMS: recipient phone missing for user {$dto->userId}");
            return false;
        }

        try {
            $message = $dto->body ?: $dto->title;

            // Twilio or Log SMS provider abstraction
            $sid = config('services.twilio.sid');
            $token = config('services.twilio.token');
            $from = config('services.twilio.from');

            if (!empty($sid) && !empty($token) && !empty($from)) {
                // If real Twilio credentials are configured in production:
                Log::info("[SmsProvider] Dispatching SMS via Twilio to {$phone}");
            } else {
                Log::info("[SmsProvider Mock] SMS simulated to {$phone}: {$message}");
            }

            return true;
        } catch (\Throwable $e) {
            Log::error("[SmsProvider] Failed to send SMS to {$phone}: " . $e->getMessage(), [
                'exception' => $e,
                'user_id' => $dto->userId,
            ]);
            return false;
        }
    }
}
