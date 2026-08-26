<?php

declare(strict_types=1);

namespace App\Modules\Auth\Requests;

use App\Modules\Auth\DTOs\ChangePasswordDTO;
use App\Modules\Auth\Rules\StrongPasswordRule;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Class ChangePasswordRequest
 *
 * @package App\Modules\Auth\Requests
 */
class ChangePasswordRequest extends FormRequest
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
            'current_password' => ['required', 'string', 'current_password'],
            'new_password' => ['required', 'string', 'confirmed', 'different:current_password', new StrongPasswordRule()],
            'new_password_confirmation' => ['required', 'string'],
        ];
    }

    /**
     * Transform validated input to a typed DTO.
     *
     * @return ChangePasswordDTO
     */
    public function toDTO(): ChangePasswordDTO
    {
        return new ChangePasswordDTO(
            current_password: (string) $this->validated('current_password'),
            new_password: (string) $this->validated('new_password'),
            new_password_confirmation: (string) $this->validated('new_password_confirmation'),
        );
    }
}
