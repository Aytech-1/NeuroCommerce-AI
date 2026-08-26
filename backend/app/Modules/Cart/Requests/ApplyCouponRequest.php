<?php

declare(strict_types=1);

namespace App\Modules\Cart\Requests;

use App\Modules\Cart\DTOs\ApplyCouponDTO;
use Illuminate\Foundation\Http\FormRequest;

/**
 * ApplyCouponRequest
 */
class ApplyCouponRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'min:2', 'max:50'],
        ];
    }

    public function toDTO(): ApplyCouponDTO
    {
        return ApplyCouponDTO::fromArray($this->validated());
    }
}
