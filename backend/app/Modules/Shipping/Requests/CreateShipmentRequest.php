<?php

declare(strict_types=1);

namespace App\Modules\Shipping\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Class CreateShipmentRequest
 *
 * @package App\Modules\Shipping\Requests
 */
class CreateShipmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'warehouse_id' => ['required', 'uuid', 'exists:warehouses,id'],
            'carrier' => ['required', 'string', 'max:50'],
            'service_level' => ['nullable', 'string', 'max:100'],
            'tracking_number' => ['nullable', 'string', 'max:100'],
            'tracking_url' => ['nullable', 'url', 'max:500'],
            'weight' => ['nullable', 'numeric', 'min:0'],
            'cost' => ['nullable', 'numeric', 'min:0'],
            'label_url' => ['nullable', 'url', 'max:500'],
        ];
    }
}
