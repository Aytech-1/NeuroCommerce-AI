<?php

declare(strict_types=1);

namespace App\Modules\CMS\Requests;

use App\Modules\CMS\DTOs\UpdateBlogPostDTO;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Class UpdateBlogPostRequest
 *
 * @package App\Modules\CMS\Requests
 */
class UpdateBlogPostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('id') ?? $this->route('post') ?? $this->route('blog');

        return [
            'title' => ['sometimes', 'required', 'string', 'max:300'],
            'slug' => ['sometimes', 'required', 'string', 'max:255', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', 'unique:cms_blog_posts,slug,' . $id],
            'content' => ['nullable', 'string'],
            'excerpt' => ['nullable', 'string', 'max:500'],
            'category' => ['nullable', 'string', 'max:100'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:50'],
            'featured_image' => ['nullable', 'string', 'max:500'],
            'status' => ['sometimes', 'required', 'string', 'in:draft,published,archived'],
            'is_featured' => ['nullable', 'boolean'],
            'meta_title' => ['nullable', 'string', 'max:200'],
            'meta_description' => ['nullable', 'string', 'max:500'],
            'published_at' => ['nullable', 'date'],
        ];
    }

    public function toDTO(): UpdateBlogPostDTO
    {
        return UpdateBlogPostDTO::fromRequest($this);
    }
}
