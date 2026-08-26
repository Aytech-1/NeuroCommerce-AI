<?php

declare(strict_types=1);

namespace App\Modules\Auth\Contracts;

use App\Core\Contracts\BaseRepositoryInterface;
use App\Modules\Auth\Models\Address;
use Illuminate\Database\Eloquent\Collection;

/**
 * Interface AddressRepositoryInterface
 *
 * @package App\Modules\Auth\Contracts
 */
interface AddressRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Get all addresses for a specific user.
     *
     * @param string $userId
     * @return Collection
     */
    public function getUserAddresses(string $userId): Collection;

    /**
     * Set an address as the default address for a user.
     *
     * @param string $userId
     * @param string $addressId
     * @return Address
     */
    public function setDefaultAddress(string $userId, string $addressId): Address;
}
