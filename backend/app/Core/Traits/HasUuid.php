<?php

declare(strict_types=1);

namespace App\Core\Traits;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

/**
 * Trait HasUuid
 *
 * Automatically generates UUID v7 primary keys for Eloquent models.
 * Ensures the model primary key is a string and non-incrementing.
 *
 * @package App\Core\Traits
 * @author NeuroCommerce AI
 * @since 1.0.0
 * @copyright 2026 NeuroCommerce AI
 */
trait HasUuid
{
    /**
     * Boot the HasUuid trait.
     *
     * @return void
     */
    protected static function bootHasUuid(): void
    {
        static::creating(function (Model $model) {
            $key = $model->getKeyName();

            if (empty($model->{$key})) {
                // Generate a true RFC 9562 UUID v7 (time-ordered)
                $model->{$key} = (string) Str::uuid7();
            }
        });
    }

    /**
     * Get the auto-incrementing key type.
     *
     * @return string
     */
    public function getKeyType(): string
    {
        return 'string';
    }

    /**
     * Get the value indicating whether the IDs are incrementing.
     *
     * @return bool
     */
    public function getIncrementing(): bool
    {
        return false;
    }
}
