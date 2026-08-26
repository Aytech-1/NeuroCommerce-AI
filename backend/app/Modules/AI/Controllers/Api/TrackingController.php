<?php

declare(strict_types=1);

namespace App\Modules\AI\Controllers\Api;

use App\Core\Helpers\ResponseHelper;
use App\Http\Controllers\Controller;
use App\Modules\AI\Services\BehaviorTrackingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Class TrackingController
 *
 * @package App\Modules\AI\Controllers\Api
 */
class TrackingController extends Controller
{
    public function __construct(
        protected readonly BehaviorTrackingService $trackingService
    ) {
    }

    public function trackEvent(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'event_type' => 'required|string|in:page_view,product_view,search,add_to_cart,remove_from_cart,add_to_wishlist,purchase,review,click,scroll',
            'session_id' => 'nullable|string|max:100',
            'product_id' => 'nullable|uuid',
            'category_id' => 'nullable|uuid',
            'search_query' => 'nullable|string|max:500',
            'page_url' => 'nullable|string|max:500',
            'referrer_url' => 'nullable|string|max:500',
            'duration_seconds' => 'nullable|integer|min:0',
            'scroll_depth' => 'nullable|integer|between:0,100',
            'device_type' => 'nullable|string|in:desktop,mobile,tablet',
            'metadata' => 'nullable|array',
        ]);

        $userId = $request->user()?->id ? (string) $request->user()->id : null;
        $event = $this->trackingService->trackEvent(
            $validated,
            $userId,
            $request->ip(),
            $request->userAgent()
        );

        return ResponseHelper::created([
            'event_id' => (string) $event->id,
        ], 'Event tracked successfully.');
    }

    public function trackBatch(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'events' => 'required|array|min:1|max:50',
            'events.*.event_type' => 'required|string|in:page_view,product_view,search,add_to_cart,remove_from_cart,add_to_wishlist,purchase,review,click,scroll',
            'events.*.session_id' => 'nullable|string|max:100',
            'events.*.product_id' => 'nullable|uuid',
            'events.*.category_id' => 'nullable|uuid',
            'events.*.search_query' => 'nullable|string|max:500',
            'events.*.page_url' => 'nullable|string|max:500',
            'events.*.referrer_url' => 'nullable|string|max:500',
            'events.*.duration_seconds' => 'nullable|integer|min:0',
            'events.*.scroll_depth' => 'nullable|integer|between:0,100',
            'events.*.device_type' => 'nullable|string|in:desktop,mobile,tablet',
            'events.*.metadata' => 'nullable|array',
        ]);

        $userId = $request->user()?->id ? (string) $request->user()->id : null;
        $events = $this->trackingService->trackBatch(
            $validated['events'],
            $userId,
            $request->ip(),
            $request->userAgent()
        );

        return ResponseHelper::created([
            'tracked_count' => count($events),
        ], 'Batch events tracked successfully.');
    }

    public function trackPageView(Request $request): JsonResponse
    {
        $request->merge(['event_type' => 'page_view']);
        return $this->trackEvent($request);
    }

    public function trackProductView(Request $request): JsonResponse
    {
        $request->merge(['event_type' => 'product_view']);
        return $this->trackEvent($request);
    }

    public function trackSearch(Request $request): JsonResponse
    {
        $request->merge(['event_type' => 'search']);
        return $this->trackEvent($request);
    }
}
