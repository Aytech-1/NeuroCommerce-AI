<?php

declare(strict_types=1);

namespace App\Shared\Middleware;

use App\Core\Exceptions\AuthorizationException;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Class EnsureUserIsActive
 *
 * Blocks authenticated requests if the user account is disabled or deactivated.
 *
 * @package App\Shared\Middleware
 */
class EnsureUserIsActive
{
    /**
     * Handle an incoming request.
     *
     * @param Request $request
     * @param Closure(Request): (Response) $next
     * @return Response
     * @throws AuthorizationException
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && ! $user->isActive()) {
            throw new AuthorizationException('Your account is currently disabled. Please contact customer support.');
        }

        return $next($request);
    }
}
