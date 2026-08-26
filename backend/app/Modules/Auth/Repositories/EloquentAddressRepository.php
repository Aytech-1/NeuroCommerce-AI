<?php

declare(strict_types=1);

namespace App\Modules\Auth\Repositories;

use App\Core\Abstracts\AbstractRepository;
use App\Modules\Auth\Contracts\AddressRepositoryInterface;
use App\Modules\Auth\Models\Address;
use App\Modules\Auth\Models\User;
use Illuminate\Cache\CacheManager;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Class EloquentAddressRepository
 *
 * @package App\Modules\Auth\Repositories
 */
class EloquentAddressRepository extends AbstractRepository implements AddressRepositoryInterface
{
    /**
     * EloquentAddressRepository constructor.
     *
     * @param Address $model
     * @param CacheManager|null $cache
     */
    public function __construct(Address $model, ?CacheManager $cache = null)
    {
        parent::__construct($model, $cache);
    }

    /**
     * @inheritDoc
     */
    public function getUserAddresses(string $userId): Collection
    {
        return $this->model->newQuery()
            ->with('country')
            ->where('addressable_type', User::class)
            ->where('addressable_id', $userId)
            ->orderByDesc('is_default')
            ->orderByDesc('created_at')
            ->get();
    }

    /**
     * @inheritDoc
     */
    public function setDefaultAddress(string $userId, string $addressId): Address
    {
        return DB::transaction(function () use ($userId, $addressId) {
            // Remove existing default
            $this->model->newQuery()
                ->where('addressable_type', User::class)
                ->where('addressable_id', $userId)
                ->update(['is_default' => false]);

            /** @var Address $address */
            $address = $this->model->newQuery()
                ->where('addressable_type', User::class)
                ->where('addressable_id', $userId)
                ->where('id', $addressId)
                ->firstOrFail();

            $address->update(['is_default' => true]);

            return $address->load('country');
        });
    }
}
