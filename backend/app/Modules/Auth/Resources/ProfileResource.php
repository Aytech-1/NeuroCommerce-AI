<?php

declare(strict_types=1);

namespace App\Modules\Auth\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Class ProfileResource
 *
 * @package App\Modules\Auth\Resources
 */
class ProfileResource extends JsonResource
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
            'user_id' => $this->user_id,
            'date_of_birth' => $this->date_of_birth?->format('Y-m-d'),
            'gender' => $this->gender,
            'company' => $this->company,
            'tax_id' => $this->tax_id,
            'loyalty_points' => $this->loyalty_points ?? 0,
            'customer_group' => $this->customer_group,
            'employee_id' => $this->employee_id,
            'department' => $this->department,
            'position' => $this->position,
            'hire_date' => $this->hire_date?->format('Y-m-d'),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
