<?php

declare(strict_types=1);

namespace App\Modules\CMS\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Class UploadMediaRequest
 *
 * @package App\Modules\CMS\Requests
 */
class UploadMediaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'file' => [
                'required',
                'file',
                'max:10240', // 10MB in KB
                'mimes:jpeg,jpg,png,webp,svg,pdf,gif',
            ],
            'alt_text' => ['nullable', 'string', 'max:255'],
            'collection' => ['nullable', 'string', 'max:100'],
        ];
    }
}
