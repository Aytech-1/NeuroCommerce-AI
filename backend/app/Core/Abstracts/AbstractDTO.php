<?php

declare(strict_types=1);

namespace App\Core\Abstracts;

use Spatie\LaravelData\Data;
use Illuminate\Http\Request;

/**
 * Class AbstractDTO
 *
 * Base DTO class extending Spatie Laravel Data.
 *
 * @package App\Core\Abstracts
 * @author NeuroCommerce AI
 * @since 1.0.0
 * @copyright 2026 NeuroCommerce AI
 */
abstract class AbstractDTO extends Data
{
    /**
     * Create a DTO instance from an HTTP Request.
     *
     * @param Request $request
     * @return static
     */
    public static function fromRequest(Request $request): static
    {
        return static::from($request->all());
    }

    /**
     * Transform the DTO into an array.
     *
     * @return array
     */
    public function toArray(): array
    {
        return parent::toArray();
    }
}
