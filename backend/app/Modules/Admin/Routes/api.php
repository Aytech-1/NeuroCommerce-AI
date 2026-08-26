<?php

declare(strict_types=1);

use App\Modules\Admin\Controllers\Admin\SettingController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Admin Module — Customer-facing API Routes
|--------------------------------------------------------------------------
*/

Route::prefix('api/v1')->middleware(['api'])->group(function () {
    Route::get('settings', [SettingController::class, 'publicSettings']);
});
