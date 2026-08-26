<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Admin Cart Routes
|--------------------------------------------------------------------------
*/

Route::prefix('api/v1/admin/cart')->middleware(['api', 'auth:sanctum'])->group(function () {
    // Admin cart reporting / inspection hooks if needed in future
});
