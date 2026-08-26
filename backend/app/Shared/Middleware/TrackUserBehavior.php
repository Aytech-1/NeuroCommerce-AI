<?php

declare(strict_types=1);

namespace App\Shared\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Event;
use Symfony\Component\HttpFoundation\Response;

/**
 * Class TrackUserBehavior
 *
 * Tracks page views and user behavior for AI module.
 *
 * @package App\Shared\Middleware
 * @author NeuroCommerce AI
 * @since 1.0.0
 * @copyright 2026 NeuroCommerce AI
 */
class TrackUserBehavior
{
    /**
     * Handle an incoming request.
     *
     * @param Request $request
     * @param \Closure(Request): (Response) $next
     * @return Response
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if ($request->isMethod('GET') && $response->isSuccessful()) {
            $this->dispatchBehaviorEvent($request);
        }

        return $response;
    }

    /**
     * Dispatch the behavior tracking event.
     *
     * @param Request $request
     * @return void
     */
    protected function dispatchBehaviorEvent(Request $request): void
    {
        $userId = $request->user()?->getAuthIdentifier();
        
        $metadata = [
            'url'        => $request->fullUrl(),
            'user_agent' => $request->userAgent(),
            'ip'         => $request->ip(),
            'user_id'    => $userId,
            'timestamp'  => now()->toDateTimeString(),
        ];

        Event::dispatch('behavior.tracked', [$metadata]);
    }
}
