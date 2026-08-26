<?php

declare(strict_types=1);

namespace App\Modules\Review\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Class ReviewReplyRequest
 *
 * Form request for store manager / admin response to a customer review.
 *
 * @package App\Modules\Review\Requests
 */
class ReviewReplyRequest extends FormRequest
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
        if ($this->has('admin_reply') && is_string($this->input('admin_reply'))) {
            $this->merge([
                'admin_reply' => strip_tags(trim($this->input('admin_reply'))),
            ]);
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
            'admin_reply' => ['required', 'string', 'max:5000'],
        ];
    }
}
