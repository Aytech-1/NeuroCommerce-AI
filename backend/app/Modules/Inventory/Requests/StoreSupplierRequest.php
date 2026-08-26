<?php

declare(strict_types=1);

namespace App\Modules\Inventory\Requests;

use App\Modules\Inventory\DTOs\StoreSupplierDTO;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Class StoreSupplierRequest
 *
 * @package App\Modules\Inventory\Requests
 */
class StoreSupplierRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:200'],
            'code' => ['required', 'string', 'max:50', 'unique:suppliers,code'],
            'contact_name' => ['nullable', 'string', 'max:200'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'website' => ['nullable', 'url', 'max:500'],
            'address_id' => ['nullable', 'uuid', 'exists:addresses,id'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }

    public function toDTO(): StoreSupplierDTO
    {
        return new StoreSupplierDTO(
            name: (string) $this->validated('name'),
            code: strtoupper((string) $this->validated('code')),
            contact_name: $this->validated('contact_name'),
            email: $this->validated('email'),
            phone: $this->validated('phone'),
            website: $this->validated('website'),
            address_id: $this->validated('address_id'),
            is_active: (bool) ($this->validated('is_active') ?? true)
        );
    }
}
