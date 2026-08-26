<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Requests;

use App\Modules\Catalog\DTOs\CreateAttributeDTO;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Class StoreAttributeRequest
 *
 * @package App\Modules\Catalog\Requests
 */
class StoreAttributeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'slug' => ['nullable', 'string', 'max:100', 'unique:product_attributes,slug'],
            'type' => ['nullable', 'in:select,text,number,boolean,color'],
            'is_filterable' => ['nullable', 'boolean'],
            'is_variant' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }

    public function toDTO(): CreateAttributeDTO
    {
        return new CreateAttributeDTO(
            name: (string) $this->validated('name'),
            slug: $this->validated('slug'),
            type: (string) ($this->validated('type') ?? 'select'),
            is_filterable: (bool) ($this->validated('is_filterable') ?? false),
            is_variant: (bool) ($this->validated('is_variant') ?? false),
            sort_order: (int) ($this->validated('sort_order') ?? 0),
        );
    }
}
