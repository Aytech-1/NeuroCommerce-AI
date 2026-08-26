<?php

declare(strict_types=1);

namespace App\Modules\CMS\Requests;

use App\Modules\CMS\DTOs\CreateTestimonialDTO;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Class StoreTestimonialRequest
 *
 * @package App\Modules\CMS\Requests
 */
class StoreTestimonialRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'customer_name' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string'],
            'company' => ['nullable', 'string', 'max:255'],
            'rating' => ['nullable', 'integer', 'min:1', 'max:5'],
            'avatar_url' => ['nullable', 'string', 'max:500'],
            'is_active' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }

    public function toDTO(): CreateTestimonialDTO
    {
        return CreateTestimonialDTO::fromRequest($this);
    }
}
