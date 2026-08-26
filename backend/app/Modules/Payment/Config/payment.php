<?php

declare(strict_types=1);

return [
    'name' => 'Payment',
    'enabled' => true,
    'default' => env('PAYMENT_GATEWAY', 'mock_stripe'),
    'gateways' => [
        'stripe' => [
            'key' => env('STRIPE_KEY', ''),
            'secret_key' => env('STRIPE_SECRET', ''),
            'webhook_secret' => env('STRIPE_WEBHOOK_SECRET', ''),
        ],
        'mock' => [
            'webhook_secret' => env('MOCK_WEBHOOK_SECRET', 'mock_secret_key'),
        ],
    ],
];
