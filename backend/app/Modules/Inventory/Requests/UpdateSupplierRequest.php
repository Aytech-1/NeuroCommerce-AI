<?php

declare(strict_types=1);

namespace App\Modules\Inventory\Requests;

use App\Modules\Inventory\DTOs\UpdateSupplierDTO;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Class UpdateSupplierRequest
 *
 * @package App\Modules\Inventory\Requests
 */
class UpdateSupplierRequest extends FormRequest
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
            'code' => ['sometimes', 'required', 'string', 'max:50', Rule::unique('suppliers', 'code')->ignore($id)],
            'contact_name' => ['nullable', 'string', 'max:200'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'website' => ['nullable', 'url', 'max:500'],
            'address_id' => ['nullable', 'uuid', 'exists:addresses,id'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }

    public function toDTO(): UpdateSupplierDTO
    {
        return new UpdateSupplierDTO(
            name: $this->has('name') ? (string) $this->validated('name') : null,
            code: $this->has('code') ? strtoupper((string) $this->validated('code')) : null,
            contact_name: $this->has('contact_name') ? $this->validated('contact_name') : null,
            email: $this->has('email') ? $this->validated('email') : null,
            phone: $this->has('phone') ? $this->validated('phone') : null,
            website: $this->has('website') ? $this->validated('website') : null,
            address_id: $this->has('address_id') ? $this->validated('address_id') : null,
            is_active: $this->has('is_active') ? (bool) $this->validated('is_active') : null
        );
    }
}
