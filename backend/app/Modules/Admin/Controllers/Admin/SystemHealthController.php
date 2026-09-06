<?php

declare(strict_types=1);

namespace App\Modules\Admin\Controllers\Admin;

use App\Core\Helpers\ResponseHelper;
use App\Http\Controllers\Controller;
use App\Modules\Admin\Services\SystemHealthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Class SystemHealthController
 *
 * Exposes authoritative diagnostics and infrastructure telemetry to authorized administrators.
 *
 * @package App\Modules\Admin\Controllers\Admin
 */
class SystemHealthController extends Controller
{
    public function __construct(
        protected readonly SystemHealthService $systemHealthService
    ) {
    }

    /**
     * Retrieve authoritative system health diagnostics.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        // RBAC: Guard with dashboard.view, config.view, or setting.view
        if ($user && !$user->can("dashboard.view") && !$user->can("config.view") && !$user->can("setting.view") && !$user->hasRole(["admin", "super_admin"])) {
            return ResponseHelper::forbidden("You do not have permission to access system health diagnostics.");
        }

        $health = $this->systemHealthService->getSystemHealth();

        return ResponseHelper::success(
            $health,
            "System health diagnostics retrieved successfully."
        );
    }
}