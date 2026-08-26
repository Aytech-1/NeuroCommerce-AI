<?php

declare(strict_types=1);

namespace App\Shared\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

/**
 * Class SetLocale
 *
 * Sets application locale from Accept-Language header.
 *
 * @package App\Shared\Middleware
 * @author NeuroCommerce AI
 * @since 1.0.0
 * @copyright 2026 NeuroCommerce AI
 */
class SetLocale
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
        $locale = $request->header('Accept-Language');

        if ($locale) {
            $locales = explode(',', $locale);
            $primaryLocale = strtolower(substr(trim($locales[0]), 0, 2));

            $supportedLocales = config('app.supported_locales', ['en']);
            
            if (in_array($primaryLocale, $supportedLocales, true)) {
                App::setLocale($primaryLocale);
            } else {
                App::setLocale('en');
            }
        } else {
            App::setLocale('en');
        }

        return $next($request);
    }
}
