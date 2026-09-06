<?php

declare(strict_types=1);

namespace App\Modules\Admin\Controllers\Admin;

use App\Core\Helpers\PaginationHelper;
use App\Core\Helpers\ResponseHelper;
use App\Http\Controllers\Controller;
use App\Modules\Admin\Models\AuditLog;
use App\Modules\Admin\Resources\AuditActivityLogResource;
use App\Modules\Admin\Resources\AuditLogResource;
use App\Modules\Admin\Services\AuditLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Class AuditLogController
 *
 * @package App\Modules\Admin\Controllers\Admin
 */
class AuditLogController extends Controller
{
    public function __construct(
        protected readonly AuditLogService $auditLogService
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        if ($request->user() && !$request->user()->can('audit.view')) {
            return ResponseHelper::forbidden('You do not have permission to view audit logs.');
        }

        $perPage = PaginationHelper::getPerPage($request, 50, 100);
        $filters = $request->query('filter', []);
        if ($request->has('search')) {
            $filters['search'] = $request->query('search');
        }

        $logs = $this->auditLogService->getAuditLogs($filters, $perPage);

        return ResponseHelper::paginated($logs, AuditLogResource::class);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        if ($request->user() && !$request->user()->can('audit.view')) {
            return ResponseHelper::forbidden('You do not have permission to view audit logs.');
        }

        $log = AuditLog::with('user:id,first_name,last_name,email')->find($id);

        if (!$log) {
            return ResponseHelper::notFound('Audit log not found.');
        }

        return ResponseHelper::success(new AuditLogResource($log), 'Audit log retrieved successfully.');
    }

    public function activityLogs(Request $request): JsonResponse
    {
        if ($request->user() && !$request->user()->can('audit.view')) {
            return ResponseHelper::forbidden('You do not have permission to view activity logs.');
        }

        $perPage = PaginationHelper::getPerPage($request, 50, 100);
        $filters = $request->query('filter', []);

        $logs = $this->auditLogService->getActivityLogs($filters, $perPage);

        return ResponseHelper::paginated($logs, AuditActivityLogResource::class);
    }

    public function userActivityLogs(Request $request, string $userId): JsonResponse
    {
        if ($request->user() && !$request->user()->can('audit.view')) {
            return ResponseHelper::forbidden('You do not have permission to view activity logs.');
        }

        $perPage = PaginationHelper::getPerPage($request, 50, 100);
        $filters = array_merge($request->query('filter', []), ['user_id' => $userId]);

        $logs = $this->auditLogService->getActivityLogs($filters, $perPage);

        return ResponseHelper::paginated($logs, AuditActivityLogResource::class);
    }
}
