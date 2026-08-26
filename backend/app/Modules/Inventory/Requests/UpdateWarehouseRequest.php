<?php

declare(strict_types=1);

namespace App\Modules\Inventory\Requests;

use App\Modules\Inventory\DTOs\UpdateWarehouseDTO;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Class UpdateWarehouseRequest
 *
 * @package App\Modules\Inventory\Requests
 */
class UpdateWarehouseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('id');

        return [
            'name' => ['sometimes', 'required', 'string', 'max:200'],
            'code' => ['sometimes', 'required', 'string', 'max:20', Rule::unique('warehouses', 'code')->ignore($id)],
            'address_id' => ['nullable', 'uuid', 'exists:addresses,id'],
            'is_active' => ['nullable', 'boolean'],
            'is_default' => ['nullable', 'boolean'],
            'priority' => ['nullable', 'integer', 'min:0'],
        ];
    }

    public function toDTO(): UpdateWarehouseDTO
    {
        return new UpdateWarehouseDTO(
            name: $this->has('name') ? (string) $this->validated('name') : null,
            code: $this->has('code') ? strtoupper((string) $this->validated('code')) : null,
            address_id: $this->has('address_id') ? $this->validated('address_id') : null,
            is_active: $this->has('is_active') ? (bool) $this->validated('is_active') : null,
            is_default: $this->has('is_default') ? (bool) $this->validated('is_default') : null,
            priority: $this->has('priority') ? (int) $this->validated('priority') : null
        );
    }
}
