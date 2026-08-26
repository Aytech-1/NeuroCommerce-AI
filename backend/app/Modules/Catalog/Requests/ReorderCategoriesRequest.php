<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Class ReorderCategoriesRequest
 *
 * @package App\Modules\Catalog\Requests
 */
class ReorderCategoriesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'categories' => ['required', 'array'],
            'categories.*.id' => ['required', 'uuid', 'exists:categories,id'],
            'categories.*.parent_id' => ['nullable', 'uuid', 'exists:categories,id'],
            'categories.*.sort_order' => ['nullable', 'integer', 'min:0'],
            'categories.*.depth' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
