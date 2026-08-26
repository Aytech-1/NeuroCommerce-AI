<?php

declare(strict_types=1);

namespace App\Shared\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

/**
 * Class AuditLogMiddleware
 *
 * Logs request metadata for admin audit trail.
 *
 * @package App\Shared\Middleware
 * @author NeuroCommerce AI
 * @since 1.0.0
 * @copyright 2026 NeuroCommerce AI
 */
class AuditLogMiddleware
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
        $startTime = microtime(true);

        $response = $next($request);

        if (in_array($request->method(), ['POST', 'PUT', 'PATCH', 'DELETE'], true)) {
            $this->logAuditTrail($request, $response, $startTime);
        }

        return $response;
    }

    /**
     * Log the audit trail details.
     *
     * @param Request $request
     * @param Response $response
     * @param float $startTime
     * @return void
     */
    protected function logAuditTrail(Request $request, Response $response, float $startTime): void
    {
        $responseTime = round((microtime(true) - $startTime) * 1000, 2);

        $logData = [
            'method'        => $request->method(),
            'uri'           => $request->getRequestUri(),
            'user_id'       => $request->user()?->getAuthIdentifier() ?? 'guest',
            'ip'            => $request->ip(),
            'user_agent'    => $request->userAgent(),
            'response_status' => $response->getStatusCode(),
            'response_time' => $responseTime . 'ms',
        ];

        Log::channel('audit')->info('Audit log', $logData);
    }
}
