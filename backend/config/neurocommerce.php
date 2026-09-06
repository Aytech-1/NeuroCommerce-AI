<?php

declare(strict_types=1);

/**
 * NeuroCommerce AI — Application Configuration
 *
 * Central configuration for NeuroCommerce-specific settings
 * including API versioning, pagination, caching, and feature flags.
 *
 * @package NeuroCommerce\Config
 */

return [
    /*
    |--------------------------------------------------------------------------
    | Application Identity
    |--------------------------------------------------------------------------
    */
    'name' => env('NEUROCOMMERCE_NAME', 'NeuroCommerce AI'),
    'version' => env('NEUROCOMMERCE_VERSION', '1.0.0'),
    'environment' => env('APP_ENV', 'production'),

    /*
    |--------------------------------------------------------------------------
    | API Configuration
    |--------------------------------------------------------------------------
    */
    'api' => [
        'prefix' => 'api',
        'version' => 'v1',
        'rate_limit' => [
            'enabled' => true,
            'max_attempts' => (int) env('API_RATE_LIMIT', 60),
            'decay_minutes' => 1,
            'admin_max_attempts' => (int) env('API_ADMIN_RATE_LIMIT', 120),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Pagination Defaults
    |--------------------------------------------------------------------------
    */
    'pagination' => [
        'default_per_page' => 20,
        'max_per_page' => 100,
    ],

    /*
    |--------------------------------------------------------------------------
    | Cache Configuration
    |--------------------------------------------------------------------------
    */
    'cache' => [
        'enabled' => (bool) env('NEUROCOMMERCE_CACHE_ENABLED', true),
        'ttl' => [
            'short' => 300,       // 5 minutes
            'medium' => 3600,     // 1 hour
            'long' => 86400,      // 24 hours
            'permanent' => 604800, // 7 days
        ],
        'prefix' => 'nc',
    ],

    /*
    |--------------------------------------------------------------------------
    | Currency & Locale
    |--------------------------------------------------------------------------
    */
    'currency' => [
        'default' => env('DEFAULT_CURRENCY', 'NGN'),
        'supported' => ['USD', 'EUR', 'GBP', 'NGN'],
    ],

    /*
    |--------------------------------------------------------------------------
    | Feature Flags
    |--------------------------------------------------------------------------
    */
    'features' => [
        'ai_recommendations' => (bool) env('FEATURE_AI_RECOMMENDATIONS', true),
        'multi_currency' => (bool) env('FEATURE_MULTI_CURRENCY', false),
        'multi_language' => (bool) env('FEATURE_MULTI_LANGUAGE', false),
        'social_login' => (bool) env('FEATURE_SOCIAL_LOGIN', false),
        'two_factor_auth' => (bool) env('FEATURE_TWO_FACTOR_AUTH', true),
    ],

    /*
    |--------------------------------------------------------------------------
    | Upload Configuration
    |--------------------------------------------------------------------------
    */
    'uploads' => [
        'max_file_size' => 10240, // 10MB in KB
        'allowed_image_types' => ['jpg', 'jpeg', 'png', 'webp', 'svg'],
        'image_dimensions' => [
            'thumbnail' => ['width' => 150, 'height' => 150],
            'medium' => ['width' => 600, 'height' => 600],
            'large' => ['width' => 1200, 'height' => 1200],
        ],
    ],
];
