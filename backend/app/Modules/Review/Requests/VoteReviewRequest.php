<?php

declare(strict_types=1);

namespace App\Modules\Review\Requests;

use App\Modules\Review\Enums\ReviewVoteType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

/**
 * Class VoteReviewRequest
 *
 * Form request for voting on review helpfulness.
 *
 * @package App\Modules\Review\Requests
 */
class VoteReviewRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'vote' => ['required', new Enum(ReviewVoteType::class)],
        ];
    }
}
