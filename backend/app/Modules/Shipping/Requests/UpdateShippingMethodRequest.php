<?php

declare(strict_types=1);

namespace App\Modules\Shipping\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Class UpdateShippingMethodRequest
 *
 * @package App\Modules\Shipping\Requests
 */
class UpdateShippingMethodRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'zone_id' => ['sometimes', 'required', 'uuid', 'exists:ship_zones,id'],
            'carrier' => ['sometimes', 'required', 'string', 'max:50'],
            'service_level' => ['sometimes', 'required', 'string', 'max:100'],
            'min_weight' => ['nullable', 'numeric', 'min:0'],
            'max_weight' => ['nullable', 'numeric', 'gte:min_weight'],
            'min_order_amount' => ['nullable', 'numeric', 'min:0'],
            'rate' => ['sometimes', 'required', 'numeric', 'min:0'],
            'currency_code' => ['nullable', 'string', 'size:3'],
            'estimated_days_min' => ['nullable', 'integer', 'min:1'],
            'estimated_days_max' => ['nullable', 'integer', 'gte:estimated_days_min'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
