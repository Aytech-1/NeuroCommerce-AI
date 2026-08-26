<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Requests;

use App\Modules\Catalog\DTOs\CreateBrandDTO;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Class StoreBrandRequest
 *
 * @package App\Modules\Catalog\Requests
 */
class StoreBrandRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:200', 'unique:brands,name'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:brands,slug'],
            'description' => ['nullable', 'string'],
            'logo_url' => ['nullable', 'string', 'max:500'],
            'website_url' => ['nullable', 'string', 'max:500', 'url'],
            'is_active' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }

    public function toDTO(): CreateBrandDTO
    {
        return new CreateBrandDTO(
            name: (string) $this->validated('name'),
            slug: $this->validated('slug'),
            description: $this->validated('description'),
            logo_url: $this->validated('logo_url'),
            website_url: $this->validated('website_url'),
            is_active: (bool) ($this->validated('is_active') ?? true),
            sort_order: (int) ($this->validated('sort_order') ?? 0),
        );
    }
}
