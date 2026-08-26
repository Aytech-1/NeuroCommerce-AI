<?php

declare(strict_types=1);

return [
    'name' => 'Coupon',
    'enabled' => true,
    'rate_limit' => [
        'validation_attempts_per_minute' => 10,
    ],
];
