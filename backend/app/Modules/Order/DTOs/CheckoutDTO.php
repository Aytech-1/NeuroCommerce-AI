<?php

declare(strict_types=1);

namespace App\Modules\Order\DTOs;

use App\Core\Abstracts\AbstractDTO;
use Illuminate\Http\Request;

/**
 * Class CheckoutDTO
 *
 * Strongly-typed container encapsulating validated checkout payload.
 *
 * @package App\Modules\Order\DTOs
 */
class CheckoutDTO extends AbstractDTO
{
    public function __construct(
        public readonly array $billingAddress,
        public readonly array $shippingAddress,
        public readonly ?string $shippingMethod = 'standard',
        public readonly string $paymentMethod = 'stripe',
        public readonly ?string $paymentToken = null,
        public readonly ?string $notes = null,
        public readonly ?string $couponCode = null,
        public readonly ?string $guestEmail = null,
        public readonly ?string $guestFirstName = null,
        public readonly ?string $guestLastName = null,
        public readonly ?string $guestPhone = null
    ) {
    }

    public static function fromRequest(Request $request): static
    {
        return new static(
            billingAddress: (array) $request->input('billing_address', []),
            shippingAddress: (array) $request->input('shipping_address', []),
            shippingMethod: $request->input('shipping_method', 'standard'),
            paymentMethod: $request->input('payment_method', 'stripe'),
            paymentToken: $request->input('payment_token'),
            notes: $request->input('notes'),
            couponCode: $request->input('coupon_code'),
            guestEmail: $request->input('guest_email'),
            guestFirstName: $request->input('guest_first_name'),
            guestLastName: $request->input('guest_last_name'),
            guestPhone: $request->input('guest_phone')
        );
    }
}
