<?php

declare(strict_types=1);

namespace App\Modules\Cart\Requests;

use App\Modules\Cart\DTOs\AddWishlistDTO;
use Illuminate\Foundation\Http\FormRequest;

/**
 * AddWishlistRequest
 */
class AddWishlistRequest extends FormRequest
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
            'notes' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function toDTO(): AddWishlistDTO
    {
        return AddWishlistDTO::fromArray($this->validated());
    }
}
