<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Requests;

use App\Modules\Catalog\DTOs\UpdateBrandDTO;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Class UpdateBrandRequest
 *
 * @package App\Modules\Catalog\Requests
 */
class UpdateBrandRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $brandId = $this->route('id') ?? $this->route('brand');

        return [
            'name' => ['sometimes', 'string', 'max:200', Rule::unique('brands', 'name')->ignore($brandId)],
            'slug' => ['sometimes', 'string', 'max:255', Rule::unique('brands', 'slug')->ignore($brandId)],
            'description' => ['nullable', 'string'],
            'logo_url' => ['nullable', 'string', 'max:500'],
            'website_url' => ['nullable', 'string', 'max:500', 'url'],
            'is_active' => ['sometimes', 'boolean'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
        ];
    }

    public function toDTO(): UpdateBrandDTO
    {
        return new UpdateBrandDTO(
            name: $this->has('name') ? (string) $this->validated('name') : null,
            slug: $this->has('slug') ? (string) $this->validated('slug') : null,
            description: $this->has('description') ? $this->validated('description') : null,
            logo_url: $this->has('logo_url') ? $this->validated('logo_url') : null,
            website_url: $this->has('website_url') ? $this->validated('website_url') : null,
            is_active: $this->has('is_active') ? (bool) $this->validated('is_active') : null,
            sort_order: $this->has('sort_order') ? (int) $this->validated('sort_order') : null,
        );
    }
}
