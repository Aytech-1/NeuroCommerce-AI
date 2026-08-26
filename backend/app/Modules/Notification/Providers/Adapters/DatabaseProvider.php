<?php

declare(strict_types=1);

namespace App\Modules\Notification\Providers\Adapters;

use App\Modules\Notification\Contracts\NotificationProviderInterface;
use App\Modules\Notification\Contracts\NotificationRepositoryInterface;
use App\Modules\Notification\DTOs\SendNotificationDTO;
use App\Modules\Notification\Enums\DeliveryStatus;
use App\Modules\Notification\Enums\NotificationChannel;
use Illuminate\Support\Facades\Log;

/**
 * Class DatabaseProvider
 *
 * @package App\Modules\Notification\Providers\Adapters
 */
class DatabaseProvider implements NotificationProviderInterface
{
    public function __construct(
        protected readonly NotificationRepositoryInterface $notificationRepository
    ) {
    }

    public function getChannel(): NotificationChannel
    {
        return NotificationChannel::DATABASE;
    }

    public function send(SendNotificationDTO $dto): bool
    {
        try {
            $data = [
                'user_id' => $dto->userId,
                'type' => $dto->type instanceof \BackedEnum ? $dto->type->value : $dto->type,
                'channel' => NotificationChannel::DATABASE->value,
                'title' => $dto->title,
                'body' => $dto->body,
                'data' => $dto->data,
                'status' => DeliveryStatus::SENT->value,
                'sent_at' => now(),
            ];

            $this->notificationRepository->create($data);

            return true;
        } catch (\Throwable $e) {
            Log::error("[DatabaseProvider] Failed to create database notification for user {$dto->userId}: " . $e->getMessage(), [
                'exception' => $e,
            ]);
            return false;
        }
    }
}
