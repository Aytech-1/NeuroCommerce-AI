<?php

declare(strict_types=1);

namespace App\Modules\Order\Requests;

use App\Core\Helpers\ResponseHelper;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

/**
 * Class ValidateCheckoutRequest
 *
 * Form request for pre-validating checkout addresses and cart without charging.
 *
 * @package App\Modules\Order\Requests
 */
class ValidateCheckoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'shipping_address' => ['required', 'array'],
            'shipping_address.postal_code' => ['required', 'string', 'max:20'],
            'shipping_address.country_code' => ['required', 'string', 'size:2'],
            'billing_address' => ['nullable', 'array'],
            'coupon_code' => ['nullable', 'string', 'max:50'],
        ];
    }

    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(
            ResponseHelper::validationError($validator->errors()->toArray())
        );
    }
}
