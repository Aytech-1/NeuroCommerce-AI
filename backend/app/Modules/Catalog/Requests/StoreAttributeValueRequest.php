<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Requests;

use App\Modules\Catalog\DTOs\CreateAttributeValueDTO;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Class StoreAttributeValueRequest
 *
 * @package App\Modules\Catalog\Requests
 */
class StoreAttributeValueRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'value' => ['required', 'string', 'max:200'],
            'slug' => ['nullable', 'string', 'max:200'],
            'color_hex' => ['nullable', 'string', 'regex:/^#[a-fA-F0-9]{6}$/'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }

    public function toDTO(): CreateAttributeValueDTO
    {
        return new CreateAttributeValueDTO(
            value: (string) $this->validated('value'),
            slug: $this->validated('slug'),
            color_hex: $this->validated('color_hex'),
            sort_order: (int) ($this->validated('sort_order') ?? 0),
        );
    }
}
