<?php

declare(strict_types=1);

namespace App\Modules\CMS\Requests;

use App\Modules\CMS\DTOs\CreateFaqDTO;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Class StoreFaqRequest
 *
 * @package App\Modules\CMS\Requests
 */
class StoreFaqRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'question' => ['required', 'string', 'max:500'],
            'answer' => ['required', 'string'],
            'category' => ['nullable', 'string', 'max:100'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }

    public function toDTO(): CreateFaqDTO
    {
        return CreateFaqDTO::fromRequest($this);
    }
}
