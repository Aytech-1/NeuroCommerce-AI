<?php

declare(strict_types=1);

namespace App\Modules\Auth\Requests;

use App\Modules\Auth\DTOs\ForgotPasswordDTO;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Class ForgotPasswordRequest
 *
 * @package App\Modules\Auth\Requests
 */
class ForgotPasswordRequest extends FormRequest
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
        ];
    }

    /**
     * Transform validated input to a typed DTO.
     *
     * @return ForgotPasswordDTO
     */
    public function toDTO(): ForgotPasswordDTO
    {
        return new ForgotPasswordDTO(
            email: strtolower(trim((string) $this->validated('email'))),
        );
    }
}
