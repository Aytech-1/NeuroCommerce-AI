<?php

declare(strict_types=1);

namespace App\Modules\AI\Services;

use App\Modules\AI\Models\AIBehaviorEvent;
use Illuminate\Support\Str;

/**
 * Class BehaviorTrackingService
 *
 * Ingests and processes behavioral telemetry events.
 *
 * @package App\Modules\AI\Services
 */
class BehaviorTrackingService
{
    public function trackEvent(array $data, ?string $userId = null, ?string $ipAddress = null, ?string $userAgent = null): AIBehaviorEvent
    {
        return AIBehaviorEvent::create([
            'user_id' => $userId ?? $data['user_id'] ?? null,
            'session_id' => $data['session_id'] ?? (string) Str::uuid(),
            'event_type' => $data['event_type'],
            'product_id' => $data['product_id'] ?? null,
            'category_id' => $data['category_id'] ?? null,
            'search_query' => $data['search_query'] ?? null,
            'page_url' => $data['page_url'] ?? null,
            'referrer_url' => $data['referrer_url'] ?? null,
            'duration_seconds' => $data['duration_seconds'] ?? null,
            'scroll_depth' => $data['scroll_depth'] ?? null,
            'device_type' => $data['device_type'] ?? null,
            'ip_address' => $ipAddress ?? $data['ip_address'] ?? null,
            'user_agent' => $userAgent ?? $data['user_agent'] ?? null,
            'metadata' => $data['metadata'] ?? null,
        ]);
    }

    public function trackBatch(array $events, ?string $userId = null, ?string $ipAddress = null, ?string $userAgent = null): array
    {
        $created = [];
        foreach ($events as $eventData) {
            $created[] = $this->trackEvent($eventData, $userId, $ipAddress, $userAgent);
        }
        return $created;
    }
}
