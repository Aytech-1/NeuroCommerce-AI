<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Requests;

use App\Modules\Catalog\DTOs\UpdateProductDTO;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Class UpdateProductRequest
 *
 * @package App\Modules\Catalog\Requests
 */
class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $productId = $this->route('id') ?? $this->route('product');

        return [
            'name' => ['sometimes', 'string', 'max:300'],
            'sku' => ['sometimes', 'string', 'max:100', Rule::unique('products', 'sku')->ignore($productId)],
            'slug' => ['sometimes', 'string', 'max:255', Rule::unique('products', 'slug')->ignore($productId)],
            'description' => ['nullable', 'string'],
            'short_description' => ['nullable', 'string', 'max:500'],
            'category_id' => ['nullable', 'uuid', 'exists:categories,id'],
            'brand_id' => ['nullable', 'uuid', 'exists:brands,id'],
            'base_price' => ['sometimes', 'numeric', 'min:0'],
            'compare_at_price' => ['nullable', 'numeric', 'min:0'],
            'cost_price' => ['nullable', 'numeric', 'min:0'],
            'currency_code' => ['sometimes', 'string', 'size:3', 'exists:currencies,code'],
            'tax_class' => ['sometimes', 'string', 'max:50'],
            'weight' => ['nullable', 'numeric', 'min:0'],
            'weight_unit' => ['sometimes', 'in:kg,g,lb,oz'],
            'length' => ['nullable', 'numeric', 'min:0'],
            'width' => ['nullable', 'numeric', 'min:0'],
            'height' => ['nullable', 'numeric', 'min:0'],
            'is_digital' => ['sometimes', 'boolean'],
            'is_featured' => ['sometimes', 'boolean'],
            'is_active' => ['sometimes', 'boolean'],
            'status' => ['sometimes', 'in:draft,active,archived'],
            'visibility' => ['sometimes', 'in:visible,hidden,search_only,catalog_only'],
            'meta_title' => ['nullable', 'string', 'max:200'],
            'meta_description' => ['nullable', 'string', 'max:500'],
            'published_at' => ['nullable', 'date'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:100'],
            'category_ids' => ['nullable', 'array'],
            'category_ids.*' => ['uuid', 'exists:categories,id'],
        ];
    }

    public function toDTO(): UpdateProductDTO
    {
        return new UpdateProductDTO(
            name: $this->has('name') ? (string) $this->validated('name') : null,
            sku: $this->has('sku') ? (string) $this->validated('sku') : null,
            slug: $this->has('slug') ? (string) $this->validated('slug') : null,
            description: $this->has('description') ? $this->validated('description') : null,
            short_description: $this->has('short_description') ? $this->validated('short_description') : null,
            category_id: $this->has('category_id') ? $this->validated('category_id') : null,
            brand_id: $this->has('brand_id') ? $this->validated('brand_id') : null,
            base_price: $this->has('base_price') ? (float) $this->validated('base_price') : null,
            compare_at_price: $this->has('compare_at_price') ? ($this->filled('compare_at_price') ? (float) $this->validated('compare_at_price') : null) : null,
            cost_price: $this->has('cost_price') ? ($this->filled('cost_price') ? (float) $this->validated('cost_price') : null) : null,
            currency_code: $this->has('currency_code') ? (string) $this->validated('currency_code') : null,
            tax_class: $this->has('tax_class') ? (string) $this->validated('tax_class') : null,
            weight: $this->has('weight') ? ($this->filled('weight') ? (float) $this->validated('weight') : null) : null,
            weight_unit: $this->has('weight_unit') ? (string) $this->validated('weight_unit') : null,
            length: $this->has('length') ? ($this->filled('length') ? (float) $this->validated('length') : null) : null,
            width: $this->has('width') ? ($this->filled('width') ? (float) $this->validated('width') : null) : null,
            height: $this->has('height') ? ($this->filled('height') ? (float) $this->validated('height') : null) : null,
            is_digital: $this->has('is_digital') ? (bool) $this->validated('is_digital') : null,
            is_featured: $this->has('is_featured') ? (bool) $this->validated('is_featured') : null,
            is_active: $this->has('is_active') ? (bool) $this->validated('is_active') : null,
            status: $this->has('status') ? (string) $this->validated('status') : null,
            visibility: $this->has('visibility') ? (string) $this->validated('visibility') : null,
            meta_title: $this->has('meta_title') ? $this->validated('meta_title') : null,
            meta_description: $this->has('meta_description') ? $this->validated('meta_description') : null,
            published_at: $this->has('published_at') ? $this->validated('published_at') : null,
            tags: $this->has('tags') ? $this->validated('tags') : null,
            category_ids: $this->has('category_ids') ? $this->validated('category_ids') : null,
        );
    }
}
