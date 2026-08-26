<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Class UploadProductImagesRequest
 *
 * @package App\Modules\Catalog\Requests
 */
class UploadProductImagesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'images' => ['required_without:image', 'array'],
            'images.*' => ['file', 'mimes:jpeg,png,jpg,webp,avif', 'max:5120'],
            'image' => ['required_without:images', 'file', 'mimes:jpeg,png,jpg,webp,avif', 'max:5120'],
            'alt_text' => ['nullable', 'string', 'max:255'],
            'is_primary' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
