<?php

declare(strict_types=1);

namespace App\Modules\Cart\Requests;

use App\Modules\Cart\DTOs\UpdateCartItemDTO;
use Illuminate\Foundation\Http\FormRequest;

/**
 * UpdateCartItemRequest
 */
class UpdateCartItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'quantity' => ['required', 'integer', 'min:1', 'max:100'],
        ];
    }

    public function toDTO(): UpdateCartItemDTO
    {
        return UpdateCartItemDTO::fromArray($this->validated());
    }
}
