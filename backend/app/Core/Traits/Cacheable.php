<?php

declare(strict_types=1);

namespace App\Core\Traits;

use Closure;
use Illuminate\Support\Facades\Cache;

/**
 * Trait Cacheable
 *
 * Provides Redis caching utilities to repositories and services.
 *
 * @package App\Core\Traits
 * @author NeuroCommerce AI
 * @since 1.0.0
 * @copyright 2026 NeuroCommerce AI
 */
trait Cacheable
{
    /**
     * Build a namespaced cache key from given parts.
     *
     * @param string ...$parts
     * @return string
     */
    public function cacheKey(string ...$parts): string
    {
        return implode(':', $parts);
    }

    /**
     * Remember the value in cache or execute the closure and store it.
     *
     * @param string $key
     * @param int $ttl Time to live in seconds
     * @param Closure $callback
     * @return mixed
     */
    public function remember(string $key, int $ttl, Closure $callback): mixed
    {
        return Cache::remember($key, $ttl, $callback);
    }

    /**
     * Remove an item from the cache.
     *
     * @param string $key
     * @return bool
     */
    public function forget(string $key): bool
    {
        return Cache::forget($key);
    }

    /**
     * Flush all cache items with a specific prefix.
     * Note: This requires a cache driver that supports tags (like Redis),
     * or requires iterating over keys if using basic Redis commands.
     * This implementation assumes tag support.
     *
     * @param string $prefix
     * @return void
     */
    public function flushPrefix(string $prefix): void
    {
        // Assuming tags are supported, use prefix as a tag.
        // If not using tags, direct Redis operations would be needed.
        Cache::tags([$prefix])->flush();
    }
}
