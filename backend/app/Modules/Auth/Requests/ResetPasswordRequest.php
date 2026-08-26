<?php

declare(strict_types=1);

namespace App\Modules\Auth\Requests;

use App\Modules\Auth\DTOs\ResetPasswordDTO;
use App\Modules\Auth\Rules\StrongPasswordRule;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Class ResetPasswordRequest
 *
 * @package App\Modules\Auth\Requests
 */
class ResetPasswordRequest extends FormRequest
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
            'token' => ['required', 'string'],
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string', 'confirmed', new StrongPasswordRule()],
            'password_confirmation' => ['required', 'string'],
        ];
    }

    /**
     * Transform validated input to a typed DTO.
     *
     * @return ResetPasswordDTO
     */
    public function toDTO(): ResetPasswordDTO
    {
        return new ResetPasswordDTO(
            token: (string) $this->validated('token'),
            email: strtolower(trim((string) $this->validated('email'))),
            password: (string) $this->validated('password'),
            password_confirmation: (string) $this->validated('password_confirmation'),
        );
    }
}
