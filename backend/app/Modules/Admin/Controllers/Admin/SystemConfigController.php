<?php

declare(strict_types=1);

namespace App\Modules\Admin\Controllers\Admin;

use App\Core\Helpers\ResponseHelper;
use App\Http\Controllers\Controller;
use App\Modules\Admin\Models\SystemConfig;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Class SystemConfigController
 *
 * @package App\Modules\Admin\Controllers\Admin
 */
class SystemConfigController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        if ($request->user() && !$request->user()->can('config.view')) {
            return ResponseHelper::forbidden('You do not have permission to view system configs.');
        }

        $configs = SystemConfig::all()->groupBy('namespace');
        return ResponseHelper::success($configs, 'System configurations retrieved successfully.');
    }

    public function update(Request $request, string $namespace): JsonResponse
    {
        if ($request->user() && !$request->user()->can('config.update')) {
            return ResponseHelper::forbidden('You do not have permission to update system configs.');
        }

        $validated = $request->validate([
            'configs' => 'required|array|min:1',
            'configs.*.key' => 'required|string|max:100',
            'configs.*.config_value' => 'required|array',
        ]);

        $updated = [];
        foreach ($validated['configs'] as $item) {
            $config = SystemConfig::updateOrCreate(
                ['namespace' => $namespace, 'key' => $item['key']],
                ['config_value' => $item['config_value']]
            );
            $updated[] = $config;
        }

        return ResponseHelper::success($updated, "System configuration for namespace '{$namespace}' updated successfully.");
    }
}
