<?php

declare(strict_types=1);

namespace App\Modules\Auth\Requests;

use App\Modules\Auth\DTOs\VerifyEmailDTO;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Class VerifyEmailRequest
 *
 * @package App\Modules\Auth\Requests
 */
class VerifyEmailRequest extends FormRequest
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
            'email' => ['nullable', 'string', 'email'],
        ];
    }

    /**
     * Transform validated input to a typed DTO.
     *
     * @return VerifyEmailDTO
     */
    public function toDTO(): VerifyEmailDTO
    {
        return new VerifyEmailDTO(
            token: (string) $this->validated('token'),
            email: $this->validated('email') ? strtolower(trim((string) $this->validated('email'))) : null,
        );
    }
}
