<?php

declare(strict_types=1);

namespace App\Modules\CMS\Requests;

use App\Modules\CMS\DTOs\UpdateTestimonialDTO;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Class UpdateTestimonialRequest
 *
 * @package App\Modules\CMS\Requests
 */
class UpdateTestimonialRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'customer_name' => ['sometimes', 'required', 'string', 'max:255'],
            'content' => ['sometimes', 'required', 'string'],
            'company' => ['nullable', 'string', 'max:255'],
            'rating' => ['nullable', 'integer', 'min:1', 'max:5'],
            'avatar_url' => ['nullable', 'string', 'max:500'],
            'is_active' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }

    public function toDTO(): UpdateTestimonialDTO
    {
        return UpdateTestimonialDTO::fromRequest($this);
    }
}
