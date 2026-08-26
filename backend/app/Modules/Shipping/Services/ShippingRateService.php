<?php

declare(strict_types=1);

namespace App\Modules\Shipping\Services;

use App\Core\Exceptions\EntityNotFoundException;
use App\Modules\Shipping\Contracts\ShippingRateRepositoryInterface;
use App\Modules\Shipping\Contracts\ShippingZoneRepositoryInterface;
use App\Modules\Shipping\DTOs\ShippingRateEstimateDTO;
use App\Modules\Shipping\Models\ShipRate;
use App\Modules\Shipping\Models\ShipZone;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Class ShippingRateService
 *
 * @package App\Modules\Shipping\Services
 */
class ShippingRateService
{
    public function __construct(
        private readonly ShippingZoneRepositoryInterface $zoneRepository,
        private readonly ShippingRateRepositoryInterface $rateRepository
    ) {
    }

    public function estimateRates(ShippingRateEstimateDTO $dto): Collection
    {
        $zone = $this->zoneRepository->findZoneByCountryCode($dto->countryCode);

        if (!$zone) {
            return new Collection();
        }

        return $this->rateRepository->findMatchingRates(
            zoneId: (string) $zone->id,
            weight: $dto->weight,
            orderAmount: $dto->orderAmount
        );
    }

    public function paginateZones(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        return $this->zoneRepository->paginateForAdmin($filters, $perPage);
    }

    public function getZoneById(string $id): ShipZone
    {
        /** @var ShipZone|null $zone */
        $zone = $this->zoneRepository->findById($id);

        if (!$zone) {
            throw new EntityNotFoundException('ShippingZone', $id);
        }

        return $zone;
    }

    public function createZone(array $data): ShipZone
    {
        return DB::transaction(function () use ($data) {
            /** @var ShipZone $zone */
            $zone = $this->zoneRepository->create([
                'name' => $data['name'],
                'is_active' => $data['is_active'] ?? true,
            ]);

            if (!empty($data['country_codes'])) {
                $zone->syncCountries($data['country_codes']);
            }

            return $zone;
        });
    }

    public function updateZone(string $id, array $data): ShipZone
    {
        return DB::transaction(function () use ($id, $data) {
            $zone = $this->getZoneById($id);

            $updateData = [];
            if (isset($data['name'])) {
                $updateData['name'] = $data['name'];
            }
            if (isset($data['is_active'])) {
                $updateData['is_active'] = $data['is_active'];
            }

            if (!empty($updateData)) {
                $zone->update($updateData);
            }

            if (isset($data['country_codes'])) {
                $zone->syncCountries($data['country_codes']);
            }

            return $zone;
        });
    }

    public function paginateRates(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        return $this->rateRepository->paginateForAdmin($filters, $perPage);
    }

    public function getRateById(string $id): ShipRate
    {
        /** @var ShipRate|null $rate */
        $rate = $this->rateRepository->findById($id);

        if (!$rate) {
            throw new EntityNotFoundException('ShippingRate', $id);
        }

        return $rate;
    }

    public function createRate(array $data): ShipRate
    {
        /** @var ShipRate $rate */
        $rate = $this->rateRepository->create($data);
        return $rate;
    }

    public function updateRate(string $id, array $data): ShipRate
    {
        $rate = $this->getRateById($id);
        $rate->update($data);
        return $rate;
    }
}
