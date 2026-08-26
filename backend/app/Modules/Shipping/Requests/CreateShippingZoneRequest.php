<?php

declare(strict_types=1);

namespace App\Modules\Shipping\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Class CreateShippingZoneRequest
 *
 * @package App\Modules\Shipping\Requests
 */
class CreateShippingZoneRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'is_active' => ['nullable', 'boolean'],
            'country_codes' => ['required', 'array', 'min:1'],
            'country_codes.*' => ['required', 'string', 'size:2'],
        ];
    }
}
