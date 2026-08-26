<?php

declare(strict_types=1);

namespace App\Modules\Auth\Requests;

use App\Modules\Auth\DTOs\RegisterUserDTO;
use App\Modules\Auth\Rules\StrongPasswordRule;
use App\Modules\Auth\Rules\ValidPhoneRule;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Class RegisterRequest
 *
 * @package App\Modules\Auth\Requests
 */
class RegisterRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        return true;
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
            'email' => ['required', 'string', 'email:rfc', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'confirmed', new StrongPasswordRule()],
            'password_confirmation' => ['required', 'string'],
            'phone' => ['nullable', 'string', 'max:20', new ValidPhoneRule()],
            'agree_to_terms' => ['required', 'accepted'],
        ];
    }

    /**
     * Transform validated input to a typed DTO.
     *
     * @return RegisterUserDTO
     */
    public function toDTO(): RegisterUserDTO
    {
        return new RegisterUserDTO(
            first_name: (string) $this->validated('first_name'),
            last_name: (string) $this->validated('last_name'),
            email: strtolower(trim((string) $this->validated('email'))),
            password: (string) $this->validated('password'),
            password_confirmation: (string) $this->validated('password_confirmation'),
            phone: $this->validated('phone') ? (string) $this->validated('phone') : null,
            agree_to_terms: (bool) $this->validated('agree_to_terms'),
        );
    }
}
