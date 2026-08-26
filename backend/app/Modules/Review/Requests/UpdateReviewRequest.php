<?php

declare(strict_types=1);

namespace App\Modules\Review\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Class UpdateReviewRequest
 *
 * Form request for updating a customer review.
 *
 * @package App\Modules\Review\Requests
 */
class UpdateReviewRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $sanitized = [];

        if ($this->has('title') && is_string($this->input('title'))) {
            $sanitized['title'] = strip_tags(trim($this->input('title')));
        }

        if ($this->has('body') && is_string($this->input('body'))) {
            $sanitized['body'] = strip_tags(trim($this->input('body')));
        }

        if (!empty($sanitized)) {
            $this->merge($sanitized);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'rating' => ['sometimes', 'required', 'integer', 'min:1', 'max:5'],
            'title' => ['nullable', 'string', 'max:200'],
            'body' => ['nullable', 'string', 'max:5000'],
            'images' => ['nullable', 'array', 'max:5'],
            'images.*' => ['string', 'max:500'],
        ];
    }
}
