<?php

declare(strict_types=1);

namespace App\Modules\AI\Controllers\Admin;

use App\Core\Helpers\ResponseHelper;
use App\Http\Controllers\Controller;
use App\Modules\AI\Resources\AIModelVersionResource;
use App\Modules\AI\Services\AIModelService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Class AdminAIController
 *
 * @package App\Modules\AI\Controllers\Admin
 */
class AdminAIController extends Controller
{
    public function __construct(
        protected readonly AIModelService $aiModelService
    ) {
    }

    public function models(Request $request): JsonResponse
    {
        if ($request->user() && !$request->user()->can('config.view')) {
            return ResponseHelper::forbidden('You do not have permission to view AI models.');
        }

        $models = $this->aiModelService->listModels();
        return ResponseHelper::success(
            AIModelVersionResource::collection($models),
            'AI models retrieved successfully.'
        );
    }

    public function metrics(Request $request): JsonResponse
    {
        if ($request->user() && !$request->user()->can('config.view')) {
            return ResponseHelper::forbidden('You do not have permission to view AI metrics.');
        }

        $metrics = $this->aiModelService->getMetrics();
        return ResponseHelper::success($metrics, 'AI inference metrics retrieved successfully.');
    }

    public function retrain(Request $request): JsonResponse
    {
        if ($request->user() && !$request->user()->can('config.update')) {
            return ResponseHelper::forbidden('You do not have permission to trigger model retraining.');
        }

        $validated = $request->validate([
            'model_type' => 'required|string|in:ncf,content_based,two_tower',
        ]);

        $model = $this->aiModelService->triggerRetrain($validated['model_type']);

        return ResponseHelper::created(
            new AIModelVersionResource($model),
            'Model retraining initiated successfully.'
        );
    }
}
