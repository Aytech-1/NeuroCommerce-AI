<?php

declare(strict_types=1);

namespace App\Modules\Notification\Controllers\Admin;

use App\Core\Helpers\ResponseHelper;
use App\Http\Controllers\Controller;
use App\Modules\Notification\Models\NotificationTemplate;
use App\Modules\Notification\Requests\BroadcastNotificationRequest;
use App\Modules\Notification\Services\NotificationService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;

/**
 * Class NotificationBroadcastController
 *
 * @package App\Modules\Notification\Controllers\Admin
 */
class NotificationBroadcastController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        protected readonly NotificationService $notificationService
    ) {
    }

    public function broadcast(BroadcastNotificationRequest $request): JsonResponse
    {
        $this->authorize('broadcast', NotificationTemplate::class);

        $count = $this->notificationService->broadcast($request->toDTO());

        return ResponseHelper::success(
            data: ['dispatched_count' => $count],
            message: "Notification broadcast dispatched to {$count} users."
        );
    }
}
