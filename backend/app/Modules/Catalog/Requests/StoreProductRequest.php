<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Requests;

use App\Modules\Catalog\DTOs\CreateProductDTO;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Class StoreProductRequest
 *
 * @package App\Modules\Catalog\Requests
 */
class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:300'],
            'sku' => ['required', 'string', 'max:100', 'unique:products,sku'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:products,slug'],
            'description' => ['nullable', 'string'],
            'short_description' => ['nullable', 'string', 'max:500'],
            'category_id' => ['nullable', 'uuid', 'exists:categories,id'],
            'brand_id' => ['nullable', 'uuid', 'exists:brands,id'],
            'base_price' => ['required', 'numeric', 'min:0'],
            'compare_at_price' => ['nullable', 'numeric', 'min:0'],
            'cost_price' => ['nullable', 'numeric', 'min:0'],
            'currency_code' => ['nullable', 'string', 'size:3', 'exists:currencies,code'],
            'tax_class' => ['nullable', 'string', 'max:50'],
            'weight' => ['nullable', 'numeric', 'min:0'],
            'weight_unit' => ['nullable', 'in:kg,g,lb,oz'],
            'length' => ['nullable', 'numeric', 'min:0'],
            'width' => ['nullable', 'numeric', 'min:0'],
            'height' => ['nullable', 'numeric', 'min:0'],
            'is_digital' => ['nullable', 'boolean'],
            'is_featured' => ['nullable', 'boolean'],
            'is_active' => ['nullable', 'boolean'],
            'status' => ['nullable', 'in:draft,active,archived'],
            'visibility' => ['nullable', 'in:visible,hidden,search_only,catalog_only'],
            'meta_title' => ['nullable', 'string', 'max:200'],
            'meta_description' => ['nullable', 'string', 'max:500'],
            'published_at' => ['nullable', 'date'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:100'],
            'category_ids' => ['nullable', 'array'],
            'category_ids.*' => ['uuid', 'exists:categories,id'],
        ];
    }

    public function toDTO(): CreateProductDTO
    {
        return new CreateProductDTO(
            name: (string) $this->validated('name'),
            sku: (string) $this->validated('sku'),
            slug: $this->validated('slug'),
            description: $this->validated('description'),
            short_description: $this->validated('short_description'),
            category_id: $this->validated('category_id'),
            brand_id: $this->validated('brand_id'),
            base_price: (float) $this->validated('base_price'),
            compare_at_price: $this->filled('compare_at_price') ? (float) $this->validated('compare_at_price') : null,
            cost_price: $this->filled('cost_price') ? (float) $this->validated('cost_price') : null,
            currency_code: (string) ($this->validated('currency_code') ?? 'USD'),
            tax_class: (string) ($this->validated('tax_class') ?? 'standard'),
            weight: $this->filled('weight') ? (float) $this->validated('weight') : null,
            weight_unit: (string) ($this->validated('weight_unit') ?? 'kg'),
            length: $this->filled('length') ? (float) $this->validated('length') : null,
            width: $this->filled('width') ? (float) $this->validated('width') : null,
            height: $this->filled('height') ? (float) $this->validated('height') : null,
            is_digital: (bool) ($this->validated('is_digital') ?? false),
            is_featured: (bool) ($this->validated('is_featured') ?? false),
            is_active: (bool) ($this->validated('is_active') ?? true),
            status: (string) ($this->validated('status') ?? 'draft'),
            visibility: (string) ($this->validated('visibility') ?? 'visible'),
            meta_title: $this->validated('meta_title'),
            meta_description: $this->validated('meta_description'),
            published_at: $this->validated('published_at'),
            tags: $this->validated('tags'),
            category_ids: $this->validated('category_ids'),
        );
    }
}
