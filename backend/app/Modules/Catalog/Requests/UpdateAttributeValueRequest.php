<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Requests;

use App\Modules\Catalog\DTOs\UpdateAttributeValueDTO;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Class UpdateAttributeValueRequest
 *
 * @package App\Modules\Catalog\Requests
 */
class UpdateAttributeValueRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'value' => ['sometimes', 'string', 'max:200'],
            'slug' => ['nullable', 'string', 'max:200'],
            'color_hex' => ['nullable', 'string', 'regex:/^#[a-fA-F0-9]{6}$/'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
        ];
    }

    public function toDTO(): UpdateAttributeValueDTO
    {
        return new UpdateAttributeValueDTO(
            value: $this->has('value') ? (string) $this->validated('value') : null,
            slug: $this->has('slug') ? $this->validated('slug') : null,
            color_hex: $this->has('color_hex') ? $this->validated('color_hex') : null,
            sort_order: $this->has('sort_order') ? (int) $this->validated('sort_order') : null,
        );
    }
}
