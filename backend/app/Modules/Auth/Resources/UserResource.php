<?php

declare(strict_types=1);

namespace App\Modules\Auth\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Class UserResource
 *
 * @package App\Modules\Auth\Resources
 */
class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param Request $request
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'full_name' => "{$this->first_name} {$this->last_name}",
            'email' => $this->email,
            'phone' => $this->phone,
            'avatar' => $this->avatar,
            'user_type' => $this->user_type,
            'is_active' => (bool) $this->is_active,
            'locale' => $this->locale,
            'currency_code' => $this->currency_code,
            'timezone' => $this->timezone,
            'email_verified_at' => $this->email_verified_at?->toIso8601String(),
            'last_login_at' => $this->last_login_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'profile' => $this->when(
                $this->relationLoaded('customerProfile') || $this->relationLoaded('staffProfile'),
                fn () => $this->customerProfile ? new ProfileResource($this->customerProfile) : ($this->staffProfile ? new ProfileResource($this->staffProfile) : null)
            ),
            'roles' => $this->whenLoaded('roles', fn () => $this->roles->pluck('name')->values()),
            'permissions' => $this->whenLoaded('permissions', fn () => $this->getAllPermissions()->pluck('name')->values()),
            'addresses' => AddressResource::collection($this->whenLoaded('addresses')),
        ];
    }
}
