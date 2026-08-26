<?php

declare(strict_types=1);

namespace App\Shared\Middleware;

use App\Core\Exceptions\AuthorizationException;
use Closure;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Class EnsureEmailIsVerified
 *
 * Enforces email verification on protected mutation endpoints.
 *
 * @package App\Shared\Middleware
 */
class EnsureEmailIsVerified
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

        if ($user && ($user instanceof MustVerifyEmail && ! $user->hasVerifiedEmail())) {
            throw new AuthorizationException('Your email address is not verified.');
        }

        return $next($request);
    }
}
