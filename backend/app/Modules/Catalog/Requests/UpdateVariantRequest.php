<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Requests;

use App\Modules\Catalog\DTOs\UpdateVariantDTO;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Class UpdateVariantRequest
 *
 * @package App\Modules\Catalog\Requests
 */
class UpdateVariantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $variantId = $this->route('variantId') ?? $this->route('variant');

        return [
            'sku' => ['sometimes', 'string', 'max:100', Rule::unique('product_variants', 'sku')->ignore($variantId)],
            'name' => ['nullable', 'string', 'max:300'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'compare_at_price' => ['nullable', 'numeric', 'min:0'],
            'cost_price' => ['nullable', 'numeric', 'min:0'],
            'weight' => ['nullable', 'numeric', 'min:0'],
            'barcode' => ['nullable', 'string', 'max:100'],
            'image_url' => ['nullable', 'string', 'max:500'],
            'is_active' => ['sometimes', 'boolean'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
            'attribute_value_ids' => ['nullable', 'array'],
            'attribute_value_ids.*' => ['uuid', 'exists:attribute_values,id'],
        ];
    }

    public function toDTO(): UpdateVariantDTO
    {
        return new UpdateVariantDTO(
            sku: $this->has('sku') ? (string) $this->validated('sku') : null,
            name: $this->has('name') ? $this->validated('name') : null,
            price: $this->has('price') ? ($this->filled('price') ? (float) $this->validated('price') : null) : null,
            compare_at_price: $this->has('compare_at_price') ? ($this->filled('compare_at_price') ? (float) $this->validated('compare_at_price') : null) : null,
            cost_price: $this->has('cost_price') ? ($this->filled('cost_price') ? (float) $this->validated('cost_price') : null) : null,
            weight: $this->has('weight') ? ($this->filled('weight') ? (float) $this->validated('weight') : null) : null,
            barcode: $this->has('barcode') ? $this->validated('barcode') : null,
            image_url: $this->has('image_url') ? $this->validated('image_url') : null,
            is_active: $this->has('is_active') ? (bool) $this->validated('is_active') : null,
            sort_order: $this->has('sort_order') ? (int) $this->validated('sort_order') : null,
            attribute_value_ids: $this->has('attribute_value_ids') ? $this->validated('attribute_value_ids') : null,
        );
    }
}
