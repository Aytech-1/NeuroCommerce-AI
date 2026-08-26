<?php

declare(strict_types=1);

namespace App\Modules\Shipping\Models;

use App\Core\Traits\HasUuid;
use App\Modules\Shipping\Database\Factories\ShipZoneFactory;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;

/**
 * Class ShipZone
 *
 * @package App\Modules\Shipping\Models
 * @property string $id
 * @property string $name
 * @property bool $is_active
 * @property \Carbon\CarbonInterface $created_at
 * @property \Carbon\CarbonInterface $updated_at
 * @property-read Collection|ShipRate[] $rates
 */
class ShipZone extends Model
{
    use HasUuid;
    use HasFactory;

    protected $table = 'ship_zones';

    protected $fillable = [
        'name',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    protected static function newFactory(): ShipZoneFactory
    {
        return ShipZoneFactory::new();
    }

    public function rates(): HasMany
    {
        return $this->hasMany(ShipRate::class, 'zone_id');
    }

    public function getCountries(): array
    {
        return DB::table('ship_zone_countries')
            ->where('zone_id', $this->id)
            ->pluck('country_code')
            ->toArray();
    }

    public function syncCountries(array $countryCodes): void
    {
        DB::table('ship_zone_countries')->where('zone_id', $this->id)->delete();

        $rows = array_map(fn (string $code) => [
            'zone_id' => $this->id,
            'country_code' => strtoupper(trim($code)),
        ], array_unique($countryCodes));

        if (!empty($rows)) {
            DB::table('ship_zone_countries')->insert($rows);
        }
    }
}
