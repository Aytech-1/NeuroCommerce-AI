<?php

declare(strict_types=1);

namespace App\Modules\Auth\Requests;

use App\Modules\Auth\DTOs\AddressDTO;
use App\Modules\Auth\Rules\ValidPhoneRule;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Class UpdateAddressRequest
 *
 * @package App\Modules\Auth\Requests
 */
class UpdateAddressRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'first_name' => ['sometimes', 'string', 'max:100'],
            'last_name' => ['sometimes', 'string', 'max:100'],
            'company' => ['sometimes', 'nullable', 'string', 'max:200'],
            'address_line_1' => ['sometimes', 'string', 'max:255'],
            'address_line_2' => ['sometimes', 'nullable', 'string', 'max:255'],
            'city' => ['sometimes', 'string', 'max:100'],
            'state_province' => ['sometimes', 'nullable', 'string', 'max:100'],
            'postal_code' => ['sometimes', 'string', 'max:20'],
            'country_code' => ['sometimes', 'string', 'size:2', 'exists:countries,code'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:20', new ValidPhoneRule()],
            'address_type' => ['sometimes', 'in:billing,shipping,warehouse,other'],
            'label' => ['sometimes', 'nullable', 'string', 'max:100'],
            'is_default' => ['sometimes', 'boolean'],
            'latitude' => ['sometimes', 'nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['sometimes', 'nullable', 'numeric', 'between:-180,180'],
        ];
    }

    /**
     * Transform validated input to a typed DTO.
     *
     * @return AddressDTO
     */
    public function toDTO(): AddressDTO
    {
        return new AddressDTO(
            first_name: (string) ($this->input('first_name') ?? ''),
            last_name: (string) ($this->input('last_name') ?? ''),
            address_line_1: (string) ($this->input('address_line_1') ?? ''),
            city: (string) ($this->input('city') ?? ''),
            postal_code: (string) ($this->input('postal_code') ?? ''),
            country_code: strtoupper((string) ($this->input('country_code') ?? 'US')),
            address_type: (string) ($this->input('address_type') ?? 'shipping'),
            label: $this->has('label') ? ($this->input('label') ? (string) $this->input('label') : null) : null,
            company: $this->has('company') ? ($this->input('company') ? (string) $this->input('company') : null) : null,
            address_line_2: $this->has('address_line_2') ? ($this->input('address_line_2') ? (string) $this->input('address_line_2') : null) : null,
            state_province: $this->has('state_province') ? ($this->input('state_province') ? (string) $this->input('state_province') : null) : null,
            phone: $this->has('phone') ? ($this->input('phone') ? (string) $this->input('phone') : null) : null,
            is_default: (bool) $this->input('is_default', false),
            latitude: $this->has('latitude') && $this->input('latitude') !== null ? (float) $this->input('latitude') : null,
            longitude: $this->has('longitude') && $this->input('longitude') !== null ? (float) $this->input('longitude') : null,
        );
    }
}
