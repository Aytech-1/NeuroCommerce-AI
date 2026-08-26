<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Requests;

use App\Modules\Catalog\DTOs\UpdateAttributeDTO;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Class UpdateAttributeRequest
 *
 * @package App\Modules\Catalog\Requests
 */
class UpdateAttributeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $attributeId = $this->route('id') ?? $this->route('attribute');

        return [
            'name' => ['sometimes', 'string', 'max:100'],
            'slug' => ['sometimes', 'string', 'max:100', Rule::unique('product_attributes', 'slug')->ignore($attributeId)],
            'type' => ['sometimes', 'in:select,text,number,boolean,color'],
            'is_filterable' => ['sometimes', 'boolean'],
            'is_variant' => ['sometimes', 'boolean'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
        ];
    }

    public function toDTO(): UpdateAttributeDTO
    {
        return new UpdateAttributeDTO(
            name: $this->has('name') ? (string) $this->validated('name') : null,
            slug: $this->has('slug') ? (string) $this->validated('slug') : null,
            type: $this->has('type') ? (string) $this->validated('type') : null,
            is_filterable: $this->has('is_filterable') ? (bool) $this->validated('is_filterable') : null,
            is_variant: $this->has('is_variant') ? (bool) $this->validated('is_variant') : null,
            sort_order: $this->has('sort_order') ? (int) $this->validated('sort_order') : null,
        );
    }
}
