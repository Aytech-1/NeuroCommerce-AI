<?php

declare(strict_types=1);

namespace App\Modules\Notification\Controllers\Api;

use App\Core\Helpers\PaginationHelper;
use App\Core\Helpers\ResponseHelper;
use App\Http\Controllers\Controller;
use App\Modules\Notification\Requests\UpdatePreferencesRequest;
use App\Modules\Notification\Resources\NotificationPreferenceResource;
use App\Modules\Notification\Resources\NotificationResource;
use App\Modules\Notification\Services\NotificationPreferenceService;
use App\Modules\Notification\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Class CustomerNotificationController
 *
 * @package App\Modules\Notification\Controllers\Api
 */
class CustomerNotificationController extends Controller
{
    public function __construct(
        protected readonly NotificationService $notificationService,
        protected readonly NotificationPreferenceService $preferenceService
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $userId = (string) $request->user()->id;
        $perPage = PaginationHelper::getPerPage($request, 20);
        $filters = $request->only(['unread_only', 'channel', 'type']);

        $notifications = $this->notificationService->getUserNotifications($userId, $filters, $perPage);

        return ResponseHelper::paginated($notifications, NotificationResource::class);
    }

    public function unreadCount(Request $request): JsonResponse
    {
        $userId = (string) $request->user()->id;
        $count = $this->notificationService->getUnreadCount($userId);

        return ResponseHelper::success(
            data: ['unread_count' => $count],
            message: 'Unread notification count retrieved.'
        );
    }

    public function markAsRead(Request $request, string $id): JsonResponse
    {
        $userId = (string) $request->user()->id;
        $this->notificationService->markAsRead($id, $userId);

        return ResponseHelper::success(
            data: null,
            message: 'Notification marked as read.'
        );
    }

    public function markAllAsRead(Request $request): JsonResponse
    {
        $userId = (string) $request->user()->id;
        $updatedCount = $this->notificationService->markAllAsRead($userId);

        return ResponseHelper::success(
            data: ['updated_count' => $updatedCount],
            message: 'All notifications marked as read.'
        );
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $userId = (string) $request->user()->id;
        $this->notificationService->deleteNotification($id, $userId);

        return ResponseHelper::success(
            data: null,
            message: 'Notification deleted successfully.'
        );
    }

    public function getPreferences(Request $request): JsonResponse
    {
        $userId = (string) $request->user()->id;
        $preferences = $this->preferenceService->getUserPreferences($userId);

        return ResponseHelper::success(
            data: NotificationPreferenceResource::collection($preferences),
            message: 'Notification preferences retrieved.'
        );
    }

    public function updatePreferences(UpdatePreferencesRequest $request): JsonResponse
    {
        $userId = (string) $request->user()->id;
        $updated = $this->preferenceService->updatePreferences($userId, $request->toDTO());

        return ResponseHelper::success(
            data: NotificationPreferenceResource::collection($updated),
            message: 'Notification preferences updated successfully.'
        );
    }
}
