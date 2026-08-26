<?php

declare(strict_types=1);

namespace App\Modules\Coupon\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Class ValidateCouponRequest
 *
 * @package App\Modules\Coupon\Requests
 */
class ValidateCouponRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'max:50'],
            'cart_id' => ['nullable', 'uuid'],
            'subtotal' => ['nullable', 'numeric', 'min:0'],
        ];
    }
}
