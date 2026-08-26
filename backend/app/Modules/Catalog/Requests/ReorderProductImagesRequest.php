<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Class ReorderProductImagesRequest
 *
 * @package App\Modules\Catalog\Requests
 */
class ReorderProductImagesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'images' => ['required', 'array'],
            'images.*.id' => ['required', 'uuid', 'exists:product_images,id'],
            'images.*.sort_order' => ['required', 'integer', 'min:0'],
        ];
    }
}
