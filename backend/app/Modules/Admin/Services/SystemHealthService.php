<?php

declare(strict_types=1);

namespace App\Modules\Admin\Services;

use App\Modules\AI\Contracts\AIProviderInterface;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Throwable;

/**
 * Class SystemHealthService
 *
 * Authoritative diagnostic engine for system health, persistence, cache,
 * queue configuration, storage, and operational security posture.
 *
 * @package App\Modules\Admin\Services
 */
class SystemHealthService
{
    /**
     * Perform comprehensive authoritative diagnostics.
     *
     * @return array<string, mixed>
     */
    public function getSystemHealth(): array
    {
        $checkedAt = now()->toIso8601String();
        $warnings = [];

        // 1. Application Diagnostic Check
        $appEnv = (string) config("app.env", "production");
        $debugMode = (bool) config("app.debug", false);
        $appKeyConfigured = !empty(config("app.key"));

        if ($appEnv === "production" && $debugMode) {
            $warnings[] = [
                "type" => "security",
                "severity" => "warning",
                "message" => "Application debug mode is enabled in production environment.",
            ];
        }

        if (!$appKeyConfigured) {
            $warnings[] = [
                "type" => "security",
                "severity" => "critical",
                "message" => "Application encryption key (APP_KEY) is missing or not configured.",
            ];
        }

        $appStatus = [
            "status" => $appKeyConfigured ? "healthy" : "unhealthy",
            "name" => (string) config("neurocommerce.name", "NeuroCommerce AI"),
            "version" => (string) config("neurocommerce.version", "1.0.0"),
            "environment" => $appEnv,
            "debug_mode" => $debugMode,
            "laravel_version" => app()->version(),
            "php_version" => PHP_VERSION,
            "timezone" => (string) config("app.timezone", "UTC"),
            "locale" => (string) config("app.locale", "en"),
        ];

        // 2. Database Persistence Diagnostic Check
        $dbStart = hrtime(true);
        try {
            DB::connection()->getPdo();
            DB::select("SELECT 1");
            $dbLatency = round((hrtime(true) - $dbStart) / 1e6, 2);
            $dbStatus = [
                "status" => "healthy",
                "connection" => (string) config("database.default", "mysql"),
                "database_name" => (string) config("database.connections." . config("database.default") . ".database", "neurocommerce_ai"),
                "response_time_ms" => $dbLatency,
            ];
        } catch (Throwable) {
            $dbStatus = [
                "status" => "unhealthy",
                "connection" => (string) config("database.default", "mysql"),
                "error" => "Database connectivity failure.",
                "response_time_ms" => null,
            ];
            $warnings[] = [
                "type" => "infrastructure",
                "severity" => "critical",
                "message" => "Database persistence service is not responding normally.",
            ];
        }

        // 3. Cache Subsystem Diagnostic Check
        $cacheDriver = (string) config("cache.default", "file");
        $cacheStart = hrtime(true);
        try {
            $probeKey = "nc_health_probe_" . uniqid();
            Cache::put($probeKey, 1, 10);
            $probeVal = Cache::get($probeKey);
            Cache::forget($probeKey);
            $cacheLatency = round((hrtime(true) - $cacheStart) / 1e6, 2);
            $cacheStatus = [
                "status" => ($probeVal === 1) ? "healthy" : "degraded",
                "driver" => $cacheDriver,
                "response_time_ms" => $cacheLatency,
            ];
        } catch (Throwable) {
            $cacheStatus = [
                "status" => "unhealthy",
                "driver" => $cacheDriver,
                "error" => "Cache connectivity probe failed.",
                "response_time_ms" => null,
            ];
            $warnings[] = [
                "type" => "infrastructure",
                "severity" => "warning",
                "message" => "Cache subsystem is experiencing connection disruptions.",
            ];
        }

        // 4. Queue Infrastructure Status
        $queueDriver = (string) config("queue.default", "sync");
        $queueStatus = [
            "status" => "configured",
            "driver" => $queueDriver,
            "worker_status" => "Not available (managed externally)",
        ];

        // 5. Filesystem & Media Storage Diagnostic Check
        $disk = (string) config("filesystems.default", "local");
        $storageStart = hrtime(true);
        try {
            $diskInstance = Storage::disk($disk);
            $testFile = "health_check_probe.tmp";
            $diskInstance->put($testFile, "ok");
            $readVal = $diskInstance->get($testFile);
            $diskInstance->delete($testFile);
            $storageLatency = round((hrtime(true) - $storageStart) / 1e6, 2);

            $storageStatus = [
                "status" => ($readVal === "ok") ? "healthy" : "degraded",
                "disk" => $disk,
                "writable" => true,
                "response_time_ms" => $storageLatency,
            ];
        } catch (Throwable) {
            $storageStatus = [
                "status" => "degraded",
                "disk" => $disk,
                "writable" => false,
                "error" => "Filesystem write probe failed.",
                "response_time_ms" => null,
            ];
            $warnings[] = [
                "type" => "storage",
                "severity" => "warning",
                "message" => "Filesystem storage disk write probe failed.",
            ];
        }

        // 6. External & AI Service Diagnostics
        $externalServices = [];
        if (config("neurocommerce.features.ai_recommendations", true)) {
            $aiStatus = "not_configured";
            $aiProviderName = "Not bound";
            try {
                if (app()->bound(AIProviderInterface::class)) {
                    $provider = app(AIProviderInterface::class);
                    $aiHealth = $provider->checkHealth();
                    $aiStatus = $aiHealth["status"] ?? "healthy";
                    $aiProviderName = class_basename($provider);
                }
            } catch (Throwable) {
                $aiStatus = "degraded";
            }

            $externalServices[] = [
                "name" => "AI Recommendation Engine",
                "status" => $aiStatus,
                "provider" => $aiProviderName,
            ];
        }

        // 7. Overall Calculated Status
        $overallStatus = "healthy";
        if ($dbStatus["status"] === "unhealthy" || $appStatus["status"] === "unhealthy") {
            $overallStatus = "unhealthy";
        } elseif ($cacheStatus["status"] !== "healthy" || $storageStatus["status"] !== "healthy" || count($warnings) > 0) {
            $overallStatus = "degraded";
        }

        return [
            "status" => $overallStatus,
            "checked_at" => $checkedAt,
            "application" => $appStatus,
            "database" => $dbStatus,
            "cache" => $cacheStatus,
            "queue" => $queueStatus,
            "storage" => $storageStatus,
            "external_services" => $externalServices,
            "security_warnings" => $warnings,
        ];
    }
}