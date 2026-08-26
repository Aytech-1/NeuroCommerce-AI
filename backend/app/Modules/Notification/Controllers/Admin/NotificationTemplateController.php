<?php

declare(strict_types=1);

namespace App\Modules\Notification\Controllers\Admin;

use App\Core\Helpers\PaginationHelper;
use App\Core\Helpers\ResponseHelper;
use App\Http\Controllers\Controller;
use App\Modules\Notification\Models\NotificationTemplate;
use App\Modules\Notification\Requests\StoreTemplateRequest;
use App\Modules\Notification\Requests\UpdateTemplateRequest;
use App\Modules\Notification\Resources\NotificationTemplateResource;
use App\Modules\Notification\Services\NotificationTemplateService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Class NotificationTemplateController
 *
 * @package App\Modules\Notification\Controllers\Admin
 */
class NotificationTemplateController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        protected readonly NotificationTemplateService $templateService
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', NotificationTemplate::class);

        $perPage = PaginationHelper::getPerPage($request, 20);
        $filters = $request->only(['is_active', 'channel', 'notification_type', 'search']);
        $templates = $this->templateService->paginateTemplates($filters, $perPage);

        return ResponseHelper::paginated($templates, NotificationTemplateResource::class);
    }

    public function store(StoreTemplateRequest $request): JsonResponse
    {
        $this->authorize('create', NotificationTemplate::class);

        $template = $this->templateService->createTemplate($request->toDTO());

        return ResponseHelper::created(
            data: new NotificationTemplateResource($template),
            message: 'Notification template created successfully.'
        );
    }

    public function show(string $id): JsonResponse
    {
        $template = $this->templateService->getById($id);
        $this->authorize('view', $template);

        return ResponseHelper::success(
            data: new NotificationTemplateResource($template),
            message: 'Notification template retrieved successfully.'
        );
    }

    public function update(UpdateTemplateRequest $request, string $id): JsonResponse
    {
        $template = $this->templateService->getById($id);
        $this->authorize('update', $template);

        $updated = $this->templateService->updateTemplate($id, $request->toDTO());

        return ResponseHelper::success(
            data: new NotificationTemplateResource($updated),
            message: 'Notification template updated successfully.'
        );
    }

    public function destroy(string $id): JsonResponse
    {
        $template = $this->templateService->getById($id);
        $this->authorize('delete', $template);

        $this->templateService->deleteTemplate($id);

        return ResponseHelper::success(
            data: null,
            message: 'Notification template deleted successfully.'
        );
    }
}
