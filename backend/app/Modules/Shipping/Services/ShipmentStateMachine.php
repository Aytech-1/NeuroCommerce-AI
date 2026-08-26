<?php

declare(strict_types=1);

namespace App\Modules\Shipping\Services;

use App\Core\Exceptions\BusinessRuleException;
use App\Modules\Shipping\Enums\ShipmentStatus;
use App\Modules\Shipping\Models\Shipment;

/**
 * Class ShipmentStateMachine
 *
 * @package App\Modules\Shipping\Services
 */
class ShipmentStateMachine
{
    private const ALLOWED_TRANSITIONS = [
        ShipmentStatus::PENDING->value => [
            ShipmentStatus::LABEL_CREATED,
            ShipmentStatus::PICKED_UP,
            ShipmentStatus::FAILED,
        ],
        ShipmentStatus::LABEL_CREATED->value => [
            ShipmentStatus::PICKED_UP,
            ShipmentStatus::IN_TRANSIT,
            ShipmentStatus::FAILED,
        ],
        ShipmentStatus::PICKED_UP->value => [
            ShipmentStatus::IN_TRANSIT,
            ShipmentStatus::OUT_FOR_DELIVERY,
            ShipmentStatus::FAILED,
        ],
        ShipmentStatus::IN_TRANSIT->value => [
            ShipmentStatus::OUT_FOR_DELIVERY,
            ShipmentStatus::DELIVERED,
            ShipmentStatus::FAILED,
            ShipmentStatus::RETURNED,
        ],
        ShipmentStatus::OUT_FOR_DELIVERY->value => [
            ShipmentStatus::DELIVERED,
            ShipmentStatus::FAILED,
            ShipmentStatus::RETURNED,
        ],
        ShipmentStatus::FAILED->value => [
            ShipmentStatus::OUT_FOR_DELIVERY,
            ShipmentStatus::IN_TRANSIT,
            ShipmentStatus::RETURNED,
        ],
        ShipmentStatus::DELIVERED->value => [],
        ShipmentStatus::RETURNED->value => [],
    ];

    public function canTransition(ShipmentStatus $from, ShipmentStatus $to): bool
    {
        if ($from === $to) {
            return true;
        }

        $allowed = self::ALLOWED_TRANSITIONS[$from->value] ?? [];
        return in_array($to, $allowed, true);
    }

    public function applyTransition(Shipment $shipment, ShipmentStatus $newStatus): void
    {
        if ($shipment->status === $newStatus) {
            return;
        }

        if (!$this->canTransition($shipment->status, $newStatus)) {
            throw new BusinessRuleException(
                message: "Cannot transition shipment status from {$shipment->status->value} to {$newStatus->value}.",
                codeOrStatus: 422,
                errorCodeOrPrevious: 'INVALID_SHIPMENT_TRANSITION'
            );
        }

        $shipment->status = $newStatus;

        if (in_array($newStatus, [ShipmentStatus::PICKED_UP, ShipmentStatus::IN_TRANSIT], true) && $shipment->shipped_at === null) {
            $shipment->shipped_at = now();
        }

        if ($newStatus === ShipmentStatus::DELIVERED && $shipment->delivered_at === null) {
            $shipment->delivered_at = now();
        }
    }
}
