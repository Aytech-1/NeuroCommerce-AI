<?php

declare(strict_types=1);

namespace App\Modules\Admin\Controllers\Admin;

use App\Core\Helpers\ResponseHelper;
use App\Http\Controllers\Controller;
use App\Modules\Admin\Services\FeatureFlagService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Class FeatureFlagController
 *
 * @package App\Modules\Admin\Controllers\Admin
 */
class FeatureFlagController extends Controller
{
    public function __construct(
        protected readonly FeatureFlagService $featureFlagService
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        if ($request->user() && !$request->user()->can('config.view')) {
            return ResponseHelper::forbidden('You do not have permission to view feature flags.');
        }

        $flags = $this->featureFlagService->listAll();
        return ResponseHelper::success($flags, 'Feature flags retrieved successfully.');
    }

    public function toggle(Request $request, string $name): JsonResponse
    {
        if ($request->user() && !$request->user()->can('config.update')) {
            return ResponseHelper::forbidden('You do not have permission to toggle feature flags.');
        }

        $isEnabled = $request->has('is_enabled') ? (bool) $request->input('is_enabled') : null;
        $rollout = $request->has('rollout_percentage') ? (int) $request->input('rollout_percentage') : null;

        $flag = $this->featureFlagService->toggle($name, $isEnabled, $rollout);

        return ResponseHelper::success($flag, "Feature flag '{$name}' updated successfully.");
    }
}
