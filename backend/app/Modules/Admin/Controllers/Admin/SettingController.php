<?php

declare(strict_types=1);

namespace App\Modules\Admin\Controllers\Admin;

use App\Core\Helpers\ResponseHelper;
use App\Http\Controllers\Controller;
use App\Modules\Admin\Services\SettingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Class SettingController
 *
 * @package App\Modules\Admin\Controllers\Admin
 */
class SettingController extends Controller
{
    public function __construct(
        protected readonly SettingService $settingService
    ) {
    }

    /**
     * Get public store settings dictionary.
     */
    public function publicSettings(): JsonResponse
    {
        $settings = $this->settingService->getPublicSettings();
        return ResponseHelper::success($settings, 'Public settings retrieved successfully.');
    }

    public function index(Request $request): JsonResponse
    {
        if ($request->user() && !$request->user()->can('setting.view')) {
            return ResponseHelper::forbidden('You do not have permission to view settings.');
        }

        $settings = $this->settingService->getAllGrouped();
        return ResponseHelper::success($settings, 'Settings retrieved successfully.');
    }

    public function byGroup(Request $request, string $group): JsonResponse
    {
        if ($request->user() && !$request->user()->can('setting.view')) {
            return ResponseHelper::forbidden('You do not have permission to view settings.');
        }

        $settings = $this->settingService->getByGroup($group);
        return ResponseHelper::success($settings, "Settings for group '{$group}' retrieved successfully.");
    }

    public function bulkUpdate(Request $request): JsonResponse
    {
        if ($request->user() && !$request->user()->can('setting.update')) {
            return ResponseHelper::forbidden('You do not have permission to update settings.');
        }

        $validated = $request->validate([
            'settings' => 'required|array|min:1',
            'settings.*.group' => 'required|string|max:50',
            'settings.*.key' => 'required|string|max:100',
            'settings.*.value' => 'nullable',
            'settings.*.type' => 'nullable|string|in:string,integer,boolean,json,encrypted',
            'settings.*.is_public' => 'nullable|boolean',
            'settings.*.description' => 'nullable|string|max:500',
        ]);

        $updated = $this->settingService->bulkUpdate($validated['settings']);

        return ResponseHelper::success($updated, 'Settings updated successfully.');
    }
}
