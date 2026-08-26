<?php

declare(strict_types=1);

namespace App\Modules\Shipping\Listeners;

use App\Modules\Order\Enums\OrderStatus;
use App\Modules\Order\Models\Order;
use App\Modules\Shipping\Enums\ShipmentStatus;
use App\Modules\Shipping\Events\ShipmentStatusUpdated;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

/**
 * Class UpdateOrderOnShipmentStatusListener
 *
 * @package App\Modules\Shipping\Listeners
 */
class UpdateOrderOnShipmentStatusListener implements ShouldQueue
{
    use InteractsWithQueue;

    public function handle(ShipmentStatusUpdated $event): void
    {
        $shipment = $event->shipment;
        $order = $shipment->order;

        if (!$order) {
            return;
        }

        try {
            if (in_array($shipment->status, [ShipmentStatus::PICKED_UP, ShipmentStatus::IN_TRANSIT], true)) {
                if ($order->status !== OrderStatus::SHIPPED && $order->status !== OrderStatus::DELIVERED) {
                    $order->update(['status' => OrderStatus::SHIPPED]);
                }
            } elseif ($shipment->status === ShipmentStatus::DELIVERED) {
                if ($order->status !== OrderStatus::DELIVERED) {
                    $order->update(['status' => OrderStatus::DELIVERED]);
                }
            }
        } catch (\Throwable $e) {
            Log::error("Failed to advance order status on shipment status update: {$e->getMessage()}", [
                'order_id' => $order->id,
                'shipment_id' => $shipment->id,
                'status' => $shipment->status->value,
            ]);
        }
    }
}
