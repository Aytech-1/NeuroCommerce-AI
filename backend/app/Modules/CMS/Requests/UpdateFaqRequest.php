<?php

declare(strict_types=1);

namespace App\Modules\CMS\Requests;

use App\Modules\CMS\DTOs\UpdateFaqDTO;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Class UpdateFaqRequest
 *
 * @package App\Modules\CMS\Requests
 */
class UpdateFaqRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'question' => ['sometimes', 'required', 'string', 'max:500'],
            'answer' => ['sometimes', 'required', 'string'],
            'category' => ['nullable', 'string', 'max:100'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }

    public function toDTO(): UpdateFaqDTO
    {
        return UpdateFaqDTO::fromRequest($this);
    }
}
