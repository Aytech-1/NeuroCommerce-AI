<?php

declare(strict_types=1);

namespace App\Modules\Admin\Controllers\Admin;

use App\Core\Helpers\PaginationHelper;
use App\Core\Helpers\ResponseHelper;
use App\Http\Controllers\Controller;
use App\Modules\Admin\Resources\AdminNotificationResource;
use App\Modules\Notification\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Class AdminNotificationController
 *
 * @package App\Modules\Admin\Controllers\Admin
 */
class AdminNotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        if ($request->user() && !$request->user()->can('notification.view')) {
            return ResponseHelper::forbidden('You do not have permission to view admin notifications.');
        }

        $perPage = PaginationHelper::getPerPage($request, 20, 100);
        $user = $request->user();

        $notifications = Notification::where('user_id', $user->id)
            ->latest('created_at')
            ->paginate($perPage);

        return ResponseHelper::paginated($notifications, AdminNotificationResource::class);
    }

    public function unreadCount(Request $request): JsonResponse
    {
        if ($request->user() && !$request->user()->can('notification.view')) {
            return ResponseHelper::forbidden('You do not have permission to view admin notifications.');
        }

        $user = $request->user();
        $count = Notification::where('user_id', $user->id)
            ->whereNull('read_at')
            ->count();

        return ResponseHelper::success(['unread_count' => $count], 'Unread notification count retrieved.');
    }

    public function markAsRead(Request $request, string $id): JsonResponse
    {
        if ($request->user() && !$request->user()->can('notification.view')) {
            return ResponseHelper::forbidden('You do not have permission to update admin notifications.');
        }

        $user = $request->user();
        $notification = Notification::where('id', $id)
            ->where('user_id', $user->id)
            ->first();

        if (!$notification) {
            return ResponseHelper::notFound('Notification not found.');
        }

        $notification->update(['read_at' => now()]);

        return ResponseHelper::success(new AdminNotificationResource($notification), 'Notification marked as read.');
    }

    public function markAllRead(Request $request): JsonResponse
    {
        if ($request->user() && !$request->user()->can('notification.view')) {
            return ResponseHelper::forbidden('You do not have permission to update admin notifications.');
        }

        $user = $request->user();
        Notification::where('user_id', $user->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return ResponseHelper::success(null, 'All notifications marked as read.');
    }
}
