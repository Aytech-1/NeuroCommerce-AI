<?php

declare(strict_types=1);

use App\Core\Exceptions\DomainException;
use App\Core\Helpers\ResponseHelper;
use App\Shared\Middleware\AuditLogMiddleware;
use App\Shared\Middleware\ForceJsonResponse;
use App\Shared\Middleware\SetLocale;
use Illuminate\Auth\Access\AuthorizationException as LaravelAuthorizationException;
use Illuminate\Auth\AuthenticationException as LaravelAuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\Exceptions\UnauthorizedException as SpatieUnauthorizedException;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api: __DIR__ . '/../routes/api.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // API middleware group additions
        $middleware->api(prepend: [
            ForceJsonResponse::class,
            SetLocale::class,
        ]);

        // Register route middleware aliases
        $middleware->alias([
            'role' => \Spatie\Permission\Middleware\RoleMiddleware::class,
            'permission' => \Spatie\Permission\Middleware\PermissionMiddleware::class,
            'role_or_permission' => \Spatie\Permission\Middleware\RoleOrPermissionMiddleware::class,
            'active' => \App\Shared\Middleware\EnsureUserIsActive::class,
            'verified' => \App\Shared\Middleware\EnsureEmailIsVerified::class,
        ]);

        // Append audit logging for admin routes
        $middleware->appendToGroup('admin', [
            AuditLogMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Handle Laravel / Sanctum Authentication Exceptions (401)
        $exceptions->renderable(function (LaravelAuthenticationException $e, Request $request) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return ResponseHelper::unauthorized('Unauthenticated. Please log in to access this resource.');
            }
        });

        // Handle Spatie / Laravel Authorization Exceptions (403)
        $exceptions->renderable(function (SpatieUnauthorizedException|LaravelAuthorizationException|AccessDeniedHttpException $e, Request $request) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return ResponseHelper::forbidden('You do not have permission to perform this action.');
            }
        });

        // Handle Domain Exceptions (our custom exception hierarchy)
        $exceptions->renderable(function (DomainException $e, Request $request) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return ResponseHelper::error(
                    message: $e->getMessage(),
                    status: $e->getStatusCode(),
                    code: $e->getErrorCode(),
                );
            }
        });

        // Handle Validation Exceptions (422)
        $exceptions->renderable(function (ValidationException $e, Request $request) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return ResponseHelper::validationError(
                    errors: $e->errors(),
                    message: $e->getMessage(),
                );
            }
        });

        // Handle 404 Not Found
        $exceptions->renderable(function (NotFoundHttpException $e, Request $request) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return ResponseHelper::notFound('The requested resource was not found.');
            }
        });

        // Handle Method Not Allowed (405)
        $exceptions->renderable(function (MethodNotAllowedHttpException $e, Request $request) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return ResponseHelper::error(
                    message: 'Method not allowed.',
                    status: 405,
                    code: 'METHOD_NOT_ALLOWED',
                );
            }
        });
    })
    ->create();
