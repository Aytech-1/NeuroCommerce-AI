<?php

declare(strict_types=1);

namespace App\Modules\Auth\Requests;

use App\Modules\Auth\DTOs\AddressDTO;
use App\Modules\Auth\Rules\ValidPhoneRule;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Class StoreAddressRequest
 *
 * @package App\Modules\Auth\Requests
 */
class StoreAddressRequest extends FormRequest
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
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'company' => ['nullable', 'string', 'max:200'],
            'address_line_1' => ['required', 'string', 'max:255'],
            'address_line_2' => ['nullable', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:100'],
            'state_province' => ['nullable', 'string', 'max:100'],
            'postal_code' => ['required', 'string', 'max:20'],
            'country_code' => ['required', 'string', 'size:2', 'exists:countries,code'],
            'phone' => ['nullable', 'string', 'max:20', new ValidPhoneRule()],
            'address_type' => ['nullable', 'in:billing,shipping,warehouse,other'],
            'label' => ['nullable', 'string', 'max:100'],
            'is_default' => ['nullable', 'boolean'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
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
            first_name: (string) $this->validated('first_name'),
            last_name: (string) $this->validated('last_name'),
            address_line_1: (string) $this->validated('address_line_1'),
            city: (string) $this->validated('city'),
            postal_code: (string) $this->validated('postal_code'),
            country_code: strtoupper((string) $this->validated('country_code')),
            address_type: (string) $this->validated('address_type', 'shipping'),
            label: $this->validated('label') ? (string) $this->validated('label') : null,
            company: $this->validated('company') ? (string) $this->validated('company') : null,
            address_line_2: $this->validated('address_line_2') ? (string) $this->validated('address_line_2') : null,
            state_province: $this->validated('state_province') ? (string) $this->validated('state_province') : null,
            phone: $this->validated('phone') ? (string) $this->validated('phone') : null,
            is_default: (bool) $this->validated('is_default', false),
            latitude: $this->validated('latitude') !== null ? (float) $this->validated('latitude') : null,
            longitude: $this->validated('longitude') !== null ? (float) $this->validated('longitude') : null,
        );
    }
}
