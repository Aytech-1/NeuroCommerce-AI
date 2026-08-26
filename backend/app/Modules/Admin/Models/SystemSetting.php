<?php

declare(strict_types=1);

namespace App\Modules\Admin\Models;

use App\Core\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;

/**
 * Class SystemSetting
 *
 * @package App\Modules\Admin\Models
 */
class SystemSetting extends Model
{
    use HasUuid;

    protected $table = 'sys_settings';

    protected $fillable = [
        'group',
        'key',
        'value',
        'type',
        'is_public',
        'description',
    ];

    protected $casts = [
        'is_public' => 'boolean',
    ];

    /**
     * Get casted setting value according to type.
     */
    public function getParsedValueAttribute(): mixed
    {
        if ($this->value === null) {
            return null;
        }

        return match ($this->type) {
            'integer' => (int) $this->value,
            'boolean' => filter_var($this->value, FILTER_VALIDATE_BOOLEAN),
            'json' => json_decode($this->value, true),
            'encrypted' => $this->decryptValue(),
            default => (string) $this->value,
        };
    }

    /**
     * Set value attribute with automatic serialization/encryption.
     */
    public function setParsedValue(mixed $value): void
    {
        if ($value === null) {
            $this->value = null;
            return;
        }

        $this->value = match ($this->type) {
            'integer' => (string) $value,
            'boolean' => $value ? '1' : '0',
            'json' => is_string($value) ? $value : json_encode($value),
            'encrypted' => is_string($value) ? Crypt::encryptString($value) : Crypt::encryptString(json_encode($value)),
            default => (string) $value,
        };
    }

    protected function decryptValue(): ?string
    {
        try {
            return Crypt::decryptString($this->value);
        } catch (\Throwable) {
            return $this->value;
        }
    }
}
