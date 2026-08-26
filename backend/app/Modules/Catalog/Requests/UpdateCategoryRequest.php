<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Requests;

use App\Modules\Catalog\DTOs\UpdateCategoryDTO;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Class UpdateCategoryRequest
 *
 * @package App\Modules\Catalog\Requests
 */
class UpdateCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $categoryId = $this->route('id') ?? $this->route('category');

        return [
            'name' => ['sometimes', 'string', 'max:200'],
            'slug' => ['sometimes', 'string', 'max:255', Rule::unique('categories', 'slug')->ignore($categoryId)],
            'parent_id' => ['nullable', 'uuid', 'exists:categories,id', Rule::notIn([$categoryId])],
            'description' => ['nullable', 'string'],
            'image_url' => ['nullable', 'string', 'max:500'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
            'is_active' => ['sometimes', 'boolean'],
            'meta_title' => ['nullable', 'string', 'max:200'],
            'meta_description' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function toDTO(): UpdateCategoryDTO
    {
        return new UpdateCategoryDTO(
            name: $this->has('name') ? (string) $this->validated('name') : null,
            slug: $this->has('slug') ? (string) $this->validated('slug') : null,
            parent_id: $this->has('parent_id') ? $this->validated('parent_id') : null,
            description: $this->has('description') ? $this->validated('description') : null,
            image_url: $this->has('image_url') ? $this->validated('image_url') : null,
            sort_order: $this->has('sort_order') ? (int) $this->validated('sort_order') : null,
            is_active: $this->has('is_active') ? (bool) $this->validated('is_active') : null,
            meta_title: $this->has('meta_title') ? $this->validated('meta_title') : null,
            meta_description: $this->has('meta_description') ? $this->validated('meta_description') : null,
        );
    }
}
