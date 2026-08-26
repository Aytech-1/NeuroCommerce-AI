<?php

declare(strict_types=1);

namespace App\Modules\Shipping\Requests;

use App\Modules\Shipping\Enums\ShipmentStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Class UpdateShipmentStatusRequest
 *
 * @package App\Modules\Shipping\Requests
 */
class UpdateShipmentStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', 'string', Rule::enum(ShipmentStatus::class)],
            'location' => ['nullable', 'string', 'max:200'],
            'description' => ['nullable', 'string', 'max:500'],
        ];
    }
}
