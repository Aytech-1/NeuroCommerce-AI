<?php

declare(strict_types=1);

namespace App\Modules\Cart\Requests;

use App\Modules\Cart\DTOs\AddCartItemDTO;
use Illuminate\Foundation\Http\FormRequest;

/**
 * AddCartItemRequest
 */
class AddCartItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'product_id' => ['required', 'uuid', 'exists:products,id'],
            'variant_id' => ['nullable', 'uuid', 'exists:product_variants,id'],
            'quantity' => ['required', 'integer', 'min:1', 'max:100'],
        ];
    }

    public function toDTO(): AddCartItemDTO
    {
        return AddCartItemDTO::fromArray($this->validated());
    }
}
