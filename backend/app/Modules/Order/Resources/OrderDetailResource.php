<?php

declare(strict_types=1);

namespace App\Modules\Order\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Class OrderDetailResource
 *
 * @package App\Modules\Order\Resources
 */
class OrderDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_number' => $this->order_number,
            'user_id' => $this->user_id,
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'currency_code' => $this->currency_code,
            'subtotal' => (float) $this->subtotal,
            'tax_amount' => (float) $this->tax_amount,
            'shipping_amount' => (float) $this->shipping_amount,
            'discount_amount' => (float) $this->discount_amount,
            'total_amount' => (float) $this->total_amount,
            'item_count' => (int) $this->item_count,
            'coupon_code' => $this->coupon_code,
            'shipping_method' => $this->shipping_method,
            'payment_method' => $this->payment_method,
            'notes' => $this->notes,
            'admin_notes' => $this->when($request->user()?->can('order.update'), $this->admin_notes),
            'billing_address' => $this->whenLoaded('billingAddress'),
            'shipping_address' => $this->whenLoaded('shippingAddress'),
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
            'status_history' => OrderStatusHistoryResource::collection($this->whenLoaded('statusHistory')),
            'invoices' => InvoiceResource::collection($this->whenLoaded('invoices')),
            'placed_at' => $this->placed_at?->toIso8601String(),
            'paid_at' => $this->paid_at?->toIso8601String(),
            'shipped_at' => $this->shipped_at?->toIso8601String(),
            'delivered_at' => $this->delivered_at?->toIso8601String(),
            'cancelled_at' => $this->cancelled_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
