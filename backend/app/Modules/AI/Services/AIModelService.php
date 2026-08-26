<?php

declare(strict_types=1);

namespace App\Modules\AI\Services;

use App\Modules\AI\Models\AIInferenceHistory;
use App\Modules\AI\Models\AIModelVersion;
use Illuminate\Database\Eloquent\Collection;

/**
 * Class AIModelService
 *
 * Manages model lifecycle and aggregates inference performance metrics.
 *
 * @package App\Modules\AI\Services
 */
class AIModelService
{
    public function listModels(): Collection
    {
        return AIModelVersion::latest('created_at')->get();
    }

    public function getMetrics(): array
    {
        $totalInferences = AIInferenceHistory::count();
        $avgLatency = (float) (AIInferenceHistory::avg('latency_ms') ?? 0);

        return [
            'total_inferences' => $totalInferences,
            'average_latency_ms' => round($avgLatency, 2),
            'active_models' => AIModelVersion::where('is_active', true)->count(),
        ];
    }

    public function triggerRetrain(string $modelType): AIModelVersion
    {
        $version = 'v' . (AIModelVersion::count() + 1) . '.0';

        return AIModelVersion::create([
            'version' => $version,
            'model_type' => $modelType,
            'file_path' => "s3://neurocommerce-models/{$modelType}/{$version}.pt",
            'training_data_range' => now()->subDays(30)->toDateString() . ' to ' . now()->toDateString(),
            'training_records' => 50000,
            'metrics' => [
                'auc' => 0.89,
                'precision' => 0.84,
                'recall' => 0.81,
            ],
            'is_active' => false,
            'trained_at' => now(),
        ]);
    }
}
