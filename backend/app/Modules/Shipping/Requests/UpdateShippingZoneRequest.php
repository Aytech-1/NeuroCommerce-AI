<?php

declare(strict_types=1);

namespace App\Modules\Shipping\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Class UpdateShippingZoneRequest
 *
 * @package App\Modules\Shipping\Requests
 */
class UpdateShippingZoneRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:100'],
            'is_active' => ['nullable', 'boolean'],
            'country_codes' => ['sometimes', 'required', 'array', 'min:1'],
            'country_codes.*' => ['required', 'string', 'size:2'],
        ];
    }
}
