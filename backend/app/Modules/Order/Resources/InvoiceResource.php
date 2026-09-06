<?php

declare(strict_types=1);

namespace App\Modules\Order\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Class InvoiceResource
 *
 * @package App\Modules\Order\Resources
 */
class InvoiceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_id' => $this->order_id,
            'invoice_number' => $this->invoice_number,
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'subtotal' => (float) $this->subtotal,
            'tax_amount' => (float) $this->tax_amount,
            'total_amount' => (float) $this->total_amount,
            'currency_code' => $this->currency_code,
            'issued_at' => $this->issued_at?->toIso8601String(),
            'paid_at' => $this->paid_at?->toIso8601String(),
            'pdf_url' => $this->pdf_url,
            'created_at' => $this->created_at?->toIso8601String(),
            'order' => $this->whenLoaded('order', function () {
                return $this->order ? [
                    'id' => $this->order->id,
                    'order_number' => $this->order->order_number,
                    'status' => $this->order->status?->value ?? (string) $this->order->status,
                    'subtotal' => (float) $this->order->subtotal,
                    'tax_amount' => (float) $this->order->tax_amount,
                    'shipping_amount' => (float) $this->order->shipping_amount,
                    'discount_amount' => (float) $this->order->discount_amount,
                    'total_amount' => (float) $this->order->total_amount,
                    'currency_code' => $this->order->currency_code,
                    'shipping_method' => $this->order->shipping_method,
                    'payment_method' => $this->order->payment_method,
                    'coupon_code' => $this->order->coupon_code,
                    'placed_at' => $this->order->placed_at?->toIso8601String(),
                    'user' => $this->order->user ? [
                        'id' => $this->order->user->id,
                        'name' => $this->order->user->name,
                        'email' => $this->order->user->email,
                    ] : null,
                    'billing_address' => $this->order->billingAddress ? [
                        'first_name' => $this->order->billingAddress->first_name,
                        'last_name' => $this->order->billingAddress->last_name,
                        'address_line_1' => $this->order->billingAddress->address_line_1,
                        'address_line_2' => $this->order->billingAddress->address_line_2,
                        'city' => $this->order->billingAddress->city,
                        'state_province' => $this->order->billingAddress->state_province,
                        'postal_code' => $this->order->billingAddress->postal_code,
                        'country_code' => $this->order->billingAddress->country_code,
                        'phone' => $this->order->billingAddress->phone,
                    ] : null,
                    'shipping_address' => $this->order->shippingAddress ? [
                        'first_name' => $this->order->shippingAddress->first_name,
                        'last_name' => $this->order->shippingAddress->last_name,
                        'address_line_1' => $this->order->shippingAddress->address_line_1,
                        'address_line_2' => $this->order->shippingAddress->address_line_2,
                        'city' => $this->order->shippingAddress->city,
                        'state_province' => $this->order->shippingAddress->state_province,
                        'postal_code' => $this->order->shippingAddress->postal_code,
                        'country_code' => $this->order->shippingAddress->country_code,
                        'phone' => $this->order->shippingAddress->phone,
                    ] : null,
                    'items' => $this->order->items ? $this->order->items->map(fn ($item) => [
                        'id' => $item->id,
                        'product_id' => $item->product_id,
                        'variant_id' => $item->variant_id,
                        'product_sku' => $item->product_sku,
                        'product_name' => $item->product_name,
                        'variant_name' => $item->variant_name,
                        'unit_price' => (float) $item->unit_price,
                        'tax_amount' => (float) $item->tax_amount,
                        'discount_amount' => (float) $item->discount_amount,
                        'quantity' => (int) $item->quantity,
                        'line_total' => (float) $item->line_total,
                    ]) : [],
                ] : null;
            }),
        ];
    }
}
