<?php

declare(strict_types=1);

namespace App\Modules\Admin\Services;

use App\Modules\Admin\Models\FeatureFlag;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Cache;

/**
 * Class FeatureFlagService
 *
 * @package App\Modules\Admin\Services
 */
class FeatureFlagService
{
    protected const CACHE_PREFIX = 'nc_feature_flags_';

    public function listAll(): Collection
    {
        return FeatureFlag::all();
    }

    public function isEnabled(string $name): bool
    {
        return Cache::remember(self::CACHE_PREFIX . $name, 3600, function () use ($name) {
            $flag = FeatureFlag::where('name', $name)->first();
            return $flag ? $flag->is_enabled : false;
        });
    }

    public function toggle(string $name, ?bool $isEnabled = null, ?int $rolloutPercentage = null): FeatureFlag
    {
        $flag = FeatureFlag::firstOrNew(['name' => $name]);

        if ($isEnabled !== null) {
            $flag->is_enabled = $isEnabled;
        } else {
            $flag->is_enabled = !$flag->is_enabled;
        }

        if ($rolloutPercentage !== null) {
            $flag->rollout_percentage = max(0, min(100, $rolloutPercentage));
        }

        $flag->save();
        Cache::forget(self::CACHE_PREFIX . $name);

        return $flag;
    }
}
