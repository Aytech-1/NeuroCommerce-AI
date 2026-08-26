<?php

declare(strict_types=1);

namespace App\Modules\Coupon\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Class ApplyCouponRequest
 *
 * @package App\Modules\Coupon\Requests
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
            'code' => ['required', 'string', 'max:50'],
        ];
    }
}
