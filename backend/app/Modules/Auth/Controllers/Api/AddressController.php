<?php

declare(strict_types=1);

namespace App\Modules\Auth\Controllers\Api;

use App\Core\Exceptions\EntityNotFoundException;
use App\Core\Helpers\ResponseHelper;
use App\Modules\Auth\Contracts\UserServiceInterface;
use App\Modules\Auth\Models\Address;
use App\Modules\Auth\Models\User;
use App\Modules\Auth\Requests\StoreAddressRequest;
use App\Modules\Auth\Requests\UpdateAddressRequest;
use App\Modules\Auth\Resources\AddressResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

/**
 * Class AddressController
 *
 * Handles customer address management endpoints.
 *
 * @package App\Modules\Auth\Controllers\Api
 */
class AddressController extends Controller
{
    /**
     * AddressController constructor.
     *
     * @param UserServiceInterface $userService
     */
    public function __construct(
        protected readonly UserServiceInterface $userService
    ) {
    }

    /**
     * List user addresses.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $addresses = $this->userService->getUserAddresses($user->id);

        return ResponseHelper::success(AddressResource::collection($addresses), 'Addresses retrieved successfully.');
    }

    /**
     * Store a new address.
     *
     * @param StoreAddressRequest $request
     * @return JsonResponse
     */
    public function store(StoreAddressRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $address = $this->userService->createAddress($user->id, $request->toDTO());

        return ResponseHelper::created(new AddressResource($address), 'Address created successfully.');
    }

    /**
     * Show a specific address.
     *
     * @param Request $request
     * @param string $id
     * @return JsonResponse
     */
    public function show(Request $request, string $id): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        /** @var Address|null $address */
        $address = Address::where('addressable_type', User::class)
            ->where('addressable_id', $user->id)
            ->where('id', $id)
            ->with('country')
            ->first();

        if (! $address) {
            throw new EntityNotFoundException('Address', $id);
        }

        return ResponseHelper::success(new AddressResource($address), 'Address retrieved successfully.');
    }

    /**
     * Update an address.
     *
     * @param UpdateAddressRequest $request
     * @param string $id
     * @return JsonResponse
     */
    public function update(UpdateAddressRequest $request, string $id): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $address = $this->userService->updateAddress($user->id, $id, $request->toDTO());

        return ResponseHelper::success(new AddressResource($address), 'Address updated successfully.');
    }

    /**
     * Delete an address.
     *
     * @param Request $request
     * @param string $id
     * @return JsonResponse
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $this->userService->deleteAddress($user->id, $id);

        return ResponseHelper::success(null, 'Address deleted successfully.');
    }

    /**
     * Set an address as default.
     *
     * @param Request $request
     * @param string $id
     * @return JsonResponse
     */
    public function setDefault(Request $request, string $id): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $address = $this->userService->setDefaultAddress($user->id, $id);

        return ResponseHelper::success(new AddressResource($address), 'Default address updated successfully.');
    }
}
