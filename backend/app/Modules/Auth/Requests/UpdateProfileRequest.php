<?php

declare(strict_types=1);

namespace App\Modules\Auth\Requests;

use App\Modules\Auth\DTOs\UpdateProfileDTO;
use App\Modules\Auth\Rules\ValidPhoneRule;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Class UpdateProfileRequest
 *
 * @package App\Modules\Auth\Requests
 */
class UpdateProfileRequest extends FormRequest
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
            'phone' => ['sometimes', 'nullable', 'string', 'max:20', new ValidPhoneRule()],
            'avatar' => ['sometimes', 'nullable', 'string', 'url', 'max:500'],
            'locale' => ['sometimes', 'nullable', 'string', 'max:10'],
            'timezone' => ['sometimes', 'nullable', 'string', 'max:50'],
            'date_of_birth' => ['sometimes', 'nullable', 'date'],
            'gender' => ['sometimes', 'nullable', 'in:male,female,other,prefer_not_to_say'],
            'company' => ['sometimes', 'nullable', 'string', 'max:200'],
            'tax_id' => ['sometimes', 'nullable', 'string', 'max:50'],
        ];
    }

    /**
     * Transform validated input to a typed DTO.
     *
     * @return UpdateProfileDTO
     */
    public function toDTO(): UpdateProfileDTO
    {
        return new UpdateProfileDTO(
            first_name: $this->has('first_name') ? (string) $this->input('first_name') : null,
            last_name: $this->has('last_name') ? (string) $this->input('last_name') : null,
            phone: $this->has('phone') ? ($this->input('phone') ? (string) $this->input('phone') : null) : null,
            avatar: $this->has('avatar') ? ($this->input('avatar') ? (string) $this->input('avatar') : null) : null,
            locale: $this->has('locale') ? (string) $this->input('locale') : null,
            timezone: $this->has('timezone') ? (string) $this->input('timezone') : null,
            date_of_birth: $this->has('date_of_birth') ? (string) $this->input('date_of_birth') : null,
            gender: $this->has('gender') ? (string) $this->input('gender') : null,
            company: $this->has('company') ? (string) $this->input('company') : null,
            tax_id: $this->has('tax_id') ? (string) $this->input('tax_id') : null,
        );
    }
}
