<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Requests;

use App\Modules\Catalog\DTOs\CreateCategoryDTO;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Class StoreCategoryRequest
 *
 * @package App\Modules\Catalog\Requests
 */
class StoreCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:200'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:categories,slug'],
            'parent_id' => ['nullable', 'uuid', 'exists:categories,id'],
            'description' => ['nullable', 'string'],
            'image_url' => ['nullable', 'string', 'max:500'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
            'meta_title' => ['nullable', 'string', 'max:200'],
            'meta_description' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function toDTO(): CreateCategoryDTO
    {
        return new CreateCategoryDTO(
            name: (string) $this->validated('name'),
            slug: $this->validated('slug'),
            parent_id: $this->validated('parent_id'),
            description: $this->validated('description'),
            image_url: $this->validated('image_url'),
            sort_order: (int) ($this->validated('sort_order') ?? 0),
            is_active: (bool) ($this->validated('is_active') ?? true),
            meta_title: $this->validated('meta_title'),
            meta_description: $this->validated('meta_description'),
        );
    }
}
