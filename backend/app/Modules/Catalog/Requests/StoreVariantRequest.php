<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Requests;

use App\Modules\Catalog\DTOs\CreateVariantDTO;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Class StoreVariantRequest
 *
 * @package App\Modules\Catalog\Requests
 */
class StoreVariantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'sku' => ['required', 'string', 'max:100', 'unique:product_variants,sku'],
            'name' => ['nullable', 'string', 'max:300'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'compare_at_price' => ['nullable', 'numeric', 'min:0'],
            'cost_price' => ['nullable', 'numeric', 'min:0'],
            'weight' => ['nullable', 'numeric', 'min:0'],
            'barcode' => ['nullable', 'string', 'max:100'],
            'image_url' => ['nullable', 'string', 'max:500'],
            'is_active' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'attribute_value_ids' => ['nullable', 'array'],
            'attribute_value_ids.*' => ['uuid', 'exists:attribute_values,id'],
        ];
    }

    public function toDTO(): CreateVariantDTO
    {
        return new CreateVariantDTO(
            sku: (string) $this->validated('sku'),
            name: $this->validated('name'),
            price: $this->filled('price') ? (float) $this->validated('price') : null,
            compare_at_price: $this->filled('compare_at_price') ? (float) $this->validated('compare_at_price') : null,
            cost_price: $this->filled('cost_price') ? (float) $this->validated('cost_price') : null,
            weight: $this->filled('weight') ? (float) $this->validated('weight') : null,
            barcode: $this->validated('barcode'),
            image_url: $this->validated('image_url'),
            is_active: (bool) ($this->validated('is_active') ?? true),
            sort_order: (int) ($this->validated('sort_order') ?? 0),
            attribute_value_ids: $this->validated('attribute_value_ids'),
        );
    }
}
