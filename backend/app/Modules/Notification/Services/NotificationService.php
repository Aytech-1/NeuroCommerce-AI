<?php

declare(strict_types=1);

namespace App\Modules\Notification\Services;

use App\Core\Abstracts\AbstractService;
use App\Core\Exceptions\EntityNotFoundException;
use App\Modules\Auth\Models\User;
use App\Modules\Notification\Contracts\NotificationProviderInterface;
use App\Modules\Notification\Contracts\NotificationRepositoryInterface;
use App\Modules\Notification\DTOs\BroadcastNotificationDTO;
use App\Modules\Notification\DTOs\SendNotificationDTO;
use App\Modules\Notification\Enums\NotificationChannel;
use App\Modules\Notification\Enums\NotificationType;
use App\Modules\Notification\Jobs\DispatchNotificationJob;
use App\Modules\Notification\Models\Notification;
use App\Modules\Notification\Providers\Adapters\DatabaseProvider;
use App\Modules\Notification\Providers\Adapters\EmailProvider;
use App\Modules\Notification\Providers\Adapters\SmsProvider;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Log;

/**
 * Class NotificationService
 *
 * @package App\Modules\Notification\Services
 */
class NotificationService extends AbstractService
{
    /**
     * @var array<string, NotificationProviderInterface>
     */
    protected array $providers = [];

    public function __construct(
        protected readonly NotificationRepositoryInterface $notificationRepository,
        protected readonly NotificationTemplateService $templateService,
        protected readonly NotificationPreferenceService $preferenceService,
        EmailProvider $emailProvider,
        SmsProvider $smsProvider,
        DatabaseProvider $databaseProvider
    ) {
        $this->providers[NotificationChannel::EMAIL->value] = $emailProvider;
        $this->providers[NotificationChannel::SMS->value] = $smsProvider;
        $this->providers[NotificationChannel::DATABASE->value] = $databaseProvider;
    }

    public function getUserNotifications(string $userId, array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        return $this->notificationRepository->getUserNotifications($userId, $filters, $perPage);
    }

    public function getUnreadCount(string $userId): int
    {
        return $this->notificationRepository->getUnreadCount($userId);
    }

    public function markAsRead(string $id, string $userId): bool
    {
        if (!$this->notificationRepository->existsForUser($id, $userId)) {
            throw new EntityNotFoundException('Notification', $id);
        }

        return $this->notificationRepository->markAsRead($id, $userId);
    }

    public function markAllAsRead(string $userId): int
    {
        return $this->notificationRepository->markAllAsRead($userId);
    }

    public function deleteNotification(string $id, string $userId): bool
    {
        if (!$this->notificationRepository->existsForUser($id, $userId)) {
            throw new EntityNotFoundException('Notification', $id);
        }

        return $this->notificationRepository->deleteUser($id, $userId);
    }

    /**
     * Entry point to queue a notification dispatch.
     */
    public function send(SendNotificationDTO $dto): void
    {
        $channelVal = $dto->channel instanceof \BackedEnum ? $dto->channel->value : (string) $dto->channel;
        $typeVal = $dto->type instanceof \BackedEnum ? $dto->type->value : (string) $dto->type;

        // Verify preferences unless transactional
        if (!$this->preferenceService->isNotificationAllowed($dto->userId, $channelVal, $typeVal)) {
            Log::info("[NotificationService] Notification suppressed by user preferences: User {$dto->userId}, Channel {$channelVal}, Type {$typeVal}");
            return;
        }

        // Render template if available
        $template = $this->templateService->getTemplateForNotification($typeVal, $channelVal);
        $finalSubject = $dto->subject;
        $finalBody = $dto->body;

        if ($template) {
            $variables = $dto->data ?? [];
            if ($template->subject && empty($finalSubject)) {
                $finalSubject = $this->templateService->render($template->subject, $variables);
            }
            if ($template->body_template && empty($finalBody)) {
                $finalBody = $this->templateService->render($template->body_template, $variables);
            }
        }

        $preparedDTO = new SendNotificationDTO(
            userId: $dto->userId,
            type: $dto->type,
            channel: $dto->channel,
            title: $dto->title,
            body: $finalBody,
            data: $dto->data,
            recipientEmail: $dto->recipientEmail,
            recipientPhone: $dto->recipientPhone,
            subject: $finalSubject,
            isTransactional: $dto->isTransactional
        );

        // Always write to database in-app notification center as well
        if ($channelVal !== NotificationChannel::DATABASE->value) {
            $dbDTO = new SendNotificationDTO(
                userId: $dto->userId,
                type: $dto->type,
                channel: NotificationChannel::DATABASE,
                title: $dto->title,
                body: $finalBody,
                data: $dto->data,
                isTransactional: $dto->isTransactional
            );
            $this->deliver($dbDTO);
        }

        // Dispatch asynchronous delivery job onto 'notifications' queue
        DispatchNotificationJob::dispatch($preparedDTO)->onQueue('notifications');
    }

    /**
     * Executes the concrete channel provider delivery (called by DispatchNotificationJob).
     */
    public function deliver(SendNotificationDTO $dto): bool
    {
        $channelVal = $dto->channel instanceof \BackedEnum ? $dto->channel->value : (string) $dto->channel;

        if (!isset($this->providers[$channelVal])) {
            Log::warning("[NotificationService] No provider registered for channel {$channelVal}");
            return false;
        }

        return $this->providers[$channelVal]->send($dto);
    }

    /**
     * Broadcast a notification to users.
     */
    public function broadcast(BroadcastNotificationDTO $dto): int
    {
        $channelVal = $dto->channel instanceof \BackedEnum ? $dto->channel->value : (string) $dto->channel;

        $userIds = $dto->targetUserIds;
        if (empty($userIds)) {
            $userIds = User::pluck('id')->toArray();
        }

        $count = 0;
        foreach ($userIds as $userId) {
            $sendDto = new SendNotificationDTO(
                userId: (string) $userId,
                type: NotificationType::SYSTEM_BROADCAST,
                channel: $dto->channel,
                title: $dto->title,
                body: $dto->body,
                data: $dto->data,
                isTransactional: false
            );

            $this->send($sendDto);
            $count++;
        }

        return $count;
    }
}
