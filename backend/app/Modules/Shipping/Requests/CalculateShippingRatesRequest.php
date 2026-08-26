<?php

declare(strict_types=1);

namespace App\Modules\Shipping\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Class CalculateShippingRatesRequest
 *
 * @package App\Modules\Shipping\Requests
 */
class CalculateShippingRatesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'country_code' => ['required', 'string', 'size:2'],
            'postal_code' => ['nullable', 'string', 'max:20'],
            'city' => ['nullable', 'string', 'max:100'],
            'weight' => ['nullable', 'numeric', 'min:0'],
            'order_amount' => ['nullable', 'numeric', 'min:0'],
        ];
    }
}
