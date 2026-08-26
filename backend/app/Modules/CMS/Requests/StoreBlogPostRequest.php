<?php

declare(strict_types=1);

namespace App\Modules\CMS\Requests;

use App\Modules\CMS\DTOs\CreateBlogPostDTO;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Class StoreBlogPostRequest
 *
 * @package App\Modules\CMS\Requests
 */
class StoreBlogPostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:300'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:cms_blog_posts,slug', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/'],
            'content' => ['nullable', 'string'],
            'excerpt' => ['nullable', 'string', 'max:500'],
            'category' => ['nullable', 'string', 'max:100'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:50'],
            'featured_image' => ['nullable', 'string', 'max:500'],
            'status' => ['nullable', 'string', 'in:draft,published,archived'],
            'is_featured' => ['nullable', 'boolean'],
            'meta_title' => ['nullable', 'string', 'max:200'],
            'meta_description' => ['nullable', 'string', 'max:500'],
            'published_at' => ['nullable', 'date'],
        ];
    }

    public function toDTO(): CreateBlogPostDTO
    {
        return CreateBlogPostDTO::fromRequest($this);
    }
}
