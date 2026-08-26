<?php

declare(strict_types=1);

namespace App\Modules\Auth\Requests;

use App\Modules\Auth\DTOs\LoginUserDTO;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Class LoginRequest
 *
 * @package App\Modules\Auth\Requests
 */
class LoginRequest extends FormRequest
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
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
            'remember_me' => ['nullable', 'boolean'],
            'device_name' => ['nullable', 'string', 'max:255'],
        ];
    }

    /**
     * Transform validated input to a typed DTO.
     *
     * @return LoginUserDTO
     */
    public function toDTO(): LoginUserDTO
    {
        return new LoginUserDTO(
            email: strtolower(trim((string) $this->validated('email'))),
            password: (string) $this->validated('password'),
            remember_me: (bool) $this->validated('remember_me', false),
            device_name: (string) $this->validated('device_name', $this->userAgent() ?? 'Web Browser'),
        );
    }
}
