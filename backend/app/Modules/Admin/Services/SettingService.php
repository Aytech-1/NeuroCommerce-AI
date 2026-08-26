<?php

declare(strict_types=1);

namespace App\Modules\Admin\Services;

use App\Modules\Admin\Models\SystemSetting;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

/**
 * Class SettingService
 *
 * @package App\Modules\Admin\Services
 */
class SettingService
{
    protected const CACHE_PREFIX = 'nc_sys_settings_';

    /**
     * Get all public settings dictionary for storefront.
     */
    public function getPublicSettings(): array
    {
        return Cache::rememberForever(self::CACHE_PREFIX . 'public', function () {
            $settings = SystemSetting::where('is_public', true)
                ->where('type', '!=', 'encrypted')
                ->get();

            $result = [];
            foreach ($settings as $setting) {
                $result[$setting->group][$setting->key] = $setting->parsed_value;
            }
            return $result;
        });
    }

    public function getAllGrouped(): array
    {
        return Cache::rememberForever(self::CACHE_PREFIX . 'all_grouped', function () {
            $settings = SystemSetting::all();
            $grouped = [];
            foreach ($settings as $setting) {
                $grouped[$setting->group][$setting->key] = [
                    'id' => $setting->id,
                    'value' => $setting->type === 'encrypted' ? '********' : $setting->parsed_value,
                    'type' => $setting->type,
                    'is_public' => $setting->is_public,
                    'description' => $setting->description,
                ];
            }
            return $grouped;
        });
    }

    public function getByGroup(string $group): array
    {
        return Cache::rememberForever(self::CACHE_PREFIX . 'group_' . $group, function () use ($group) {
            $settings = SystemSetting::where('group', $group)->get();
            $result = [];
            foreach ($settings as $setting) {
                $result[$setting->key] = [
                    'id' => $setting->id,
                    'value' => $setting->type === 'encrypted' ? '********' : $setting->parsed_value,
                    'type' => $setting->type,
                    'is_public' => $setting->is_public,
                    'description' => $setting->description,
                ];
            }
            return $result;
        });
    }

    public function get(string $group, string $key, mixed $default = null): mixed
    {
        $all = $this->getAllGrouped();
        return $all[$group][$key]['value'] ?? $default;
    }

    public function bulkUpdate(array $settingsData): array
    {
        return DB::transaction(function () use ($settingsData) {
            $updated = [];
            foreach ($settingsData as $item) {
                $group = $item['group'] ?? 'general';
                $key = $item['key'];
                $val = $item['value'] ?? null;
                $type = $item['type'] ?? 'string';
                $isPublic = (bool) ($item['is_public'] ?? false);
                $desc = $item['description'] ?? null;

                $setting = SystemSetting::firstOrNew(['group' => $group, 'key' => $key]);
                $setting->type = $type;
                $setting->is_public = $isPublic;
                if ($desc !== null) {
                    $setting->description = $desc;
                }
                $setting->setParsedValue($val);
                $setting->save();

                $updated[] = $setting;
            }

            $this->clearCache();
            return $this->getAllGrouped();
        });
    }

    public function clearCache(): void
    {
        Cache::forget(self::CACHE_PREFIX . 'all_grouped');
        Cache::forget(self::CACHE_PREFIX . 'public');
        $groups = SystemSetting::query()->select('group')->distinct()->pluck('group');
        foreach ($groups as $grp) {
            Cache::forget(self::CACHE_PREFIX . 'group_' . $grp);
        }
    }
}
