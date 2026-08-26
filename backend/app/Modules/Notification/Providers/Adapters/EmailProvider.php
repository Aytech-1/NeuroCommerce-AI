<?php

declare(strict_types=1);

namespace App\Modules\Notification\Providers\Adapters;

use App\Modules\Notification\Contracts\NotificationProviderInterface;
use App\Modules\Notification\DTOs\SendNotificationDTO;
use App\Modules\Notification\Enums\NotificationChannel;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

/**
 * Class EmailProvider
 *
 * @package App\Modules\Notification\Providers\Adapters
 */
class EmailProvider implements NotificationProviderInterface
{
    public function getChannel(): NotificationChannel
    {
        return NotificationChannel::EMAIL;
    }

    public function send(SendNotificationDTO $dto): bool
    {
        $recipient = $dto->recipientEmail;
        $typeVal = $dto->type instanceof \BackedEnum ? $dto->type->value : (string) $dto->type;

        if (empty($recipient)) {
            Log::warning("[EmailProvider] Skipped sending email: recipient email missing for user {$dto->userId}");
            return false;
        }

        try {
            $subject = $dto->subject ?: $dto->title;
            $body = $dto->body ?: $dto->title;

            // In production/local, dispatches via Laravel Mailer (configured with SendGrid/SMTP/Log)
            Mail::raw($body, function ($message) use ($recipient, $subject) {
                $message->to($recipient)->subject($subject);
            });

            Log::info("[EmailProvider] Email successfully sent to {$recipient} for notification type {$typeVal}");
            return true;
        } catch (\Throwable $e) {
            Log::error("[EmailProvider] Failed to send email to {$recipient}: " . $e->getMessage(), [
                'exception' => $e,
                'user_id' => $dto->userId,
                'type' => $typeVal,
            ]);
            return false;
        }
    }
}
