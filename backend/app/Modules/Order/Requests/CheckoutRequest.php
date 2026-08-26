<?php

declare(strict_types=1);

namespace App\Modules\Order\Requests;

use App\Core\Helpers\ResponseHelper;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

/**
 * Class CheckoutRequest
 *
 * Form request for placing orders.
 *
 * @package App\Modules\Order\Requests
 */
class CheckoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $isGuest = ! $this->user();

        return [
            'billing_address' => ['required', 'array'],
            'billing_address.first_name' => ['required', 'string', 'max:100'],
            'billing_address.last_name' => ['required', 'string', 'max:100'],
            'billing_address.address_line_1' => ['required', 'string', 'max:255'],
            'billing_address.address_line_2' => ['nullable', 'string', 'max:255'],
            'billing_address.city' => ['required', 'string', 'max:100'],
            'billing_address.state_province' => ['nullable', 'string', 'max:100'],
            'billing_address.postal_code' => ['required', 'string', 'max:20'],
            'billing_address.country_code' => ['required', 'string', 'size:2'],
            'billing_address.phone' => ['nullable', 'string', 'max:20'],

            'shipping_address' => ['required', 'array'],
            'shipping_address.first_name' => ['required', 'string', 'max:100'],
            'shipping_address.last_name' => ['required', 'string', 'max:100'],
            'shipping_address.address_line_1' => ['required', 'string', 'max:255'],
            'shipping_address.address_line_2' => ['nullable', 'string', 'max:255'],
            'shipping_address.city' => ['required', 'string', 'max:100'],
            'shipping_address.state_province' => ['nullable', 'string', 'max:100'],
            'shipping_address.postal_code' => ['required', 'string', 'max:20'],
            'shipping_address.country_code' => ['required', 'string', 'size:2'],
            'shipping_address.phone' => ['nullable', 'string', 'max:20'],

            'shipping_method' => ['nullable', 'string', 'max:100'],
            'payment_method' => ['required', 'string', 'in:stripe,paypal,cash_on_delivery'],
            'payment_token' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'coupon_code' => ['nullable', 'string', 'max:50'],

            // Guest Fields
            'guest_email' => [$isGuest ? 'required' : 'nullable', 'email', 'max:255'],
            'guest_first_name' => [$isGuest ? 'required' : 'nullable', 'string', 'max:100'],
            'guest_last_name' => [$isGuest ? 'required' : 'nullable', 'string', 'max:100'],
            'guest_phone' => ['nullable', 'string', 'max:20'],
        ];
    }

    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(
            ResponseHelper::validationError($validator->errors()->toArray())
        );
    }
}
