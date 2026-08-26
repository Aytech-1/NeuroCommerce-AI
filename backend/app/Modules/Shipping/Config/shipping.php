<?php

declare(strict_types=1);

return [
    'name' => 'Shipping',
    'enabled' => true,
    'default_carrier' => env('DEFAULT_SHIPPING_CARRIER', 'mock_carrier'),
    'carriers' => [
        'mock' => [
            'enabled' => true,
        ],
        'ups' => [
            'access_key' => env('UPS_ACCESS_KEY'),
            'user_id' => env('UPS_USER_ID'),
            'password' => env('UPS_PASSWORD'),
        ],
        'fedex' => [
            'key' => env('FEDEX_KEY'),
            'password' => env('FEDEX_PASSWORD'),
            'account_number' => env('FEDEX_ACCOUNT_NUMBER'),
            'meter_number' => env('FEDEX_METER_NUMBER'),
        ],
        'dhl' => [
            'api_key' => env('DHL_API_KEY'),
            'api_secret' => env('DHL_API_SECRET'),
        ],
    ],
];
