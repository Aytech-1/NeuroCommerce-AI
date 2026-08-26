<?php

declare(strict_types=1);

namespace App\Modules\Inventory\Requests;

use App\Modules\Inventory\DTOs\StoreWarehouseDTO;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Class StoreWarehouseRequest
 *
 * @package App\Modules\Inventory\Requests
 */
class StoreWarehouseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:200'],
            'code' => ['required', 'string', 'max:20', 'unique:warehouses,code'],
            'address_id' => ['nullable', 'uuid', 'exists:addresses,id'],
            'is_active' => ['nullable', 'boolean'],
            'is_default' => ['nullable', 'boolean'],
            'priority' => ['nullable', 'integer', 'min:0'],
        ];
    }

    public function toDTO(): StoreWarehouseDTO
    {
        return new StoreWarehouseDTO(
            name: (string) $this->validated('name'),
            code: strtoupper((string) $this->validated('code')),
            address_id: $this->validated('address_id'),
            is_active: (bool) ($this->validated('is_active') ?? true),
            is_default: (bool) ($this->validated('is_default') ?? false),
            priority: (int) ($this->validated('priority') ?? 0)
        );
    }
}
