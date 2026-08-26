<?php

declare(strict_types=1);

namespace App\Modules\CMS\Requests;

use App\Modules\CMS\DTOs\UpdatePageDTO;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Class UpdatePageRequest
 *
 * @package App\Modules\CMS\Requests
 */
class UpdatePageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('id') ?? $this->route('page');

        return [
            'title' => ['sometimes', 'required', 'string', 'max:300'],
            'slug' => ['sometimes', 'required', 'string', 'max:255', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', 'unique:cms_pages,slug,' . $id],
            'content' => ['nullable', 'string'],
            'excerpt' => ['nullable', 'string', 'max:500'],
            'template' => ['nullable', 'string', 'max:100'],
            'status' => ['sometimes', 'required', 'string', 'in:draft,published,archived'],
            'featured_image' => ['nullable', 'string', 'max:500'],
            'meta_title' => ['nullable', 'string', 'max:200'],
            'meta_description' => ['nullable', 'string', 'max:500'],
            'published_at' => ['nullable', 'date'],
        ];
    }

    public function toDTO(): UpdatePageDTO
    {
        return UpdatePageDTO::fromRequest($this);
    }
}
