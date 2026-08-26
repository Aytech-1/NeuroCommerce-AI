<?php

declare(strict_types=1);

namespace App\Modules\Coupon\Requests;

use App\Modules\Coupon\DTOs\UpdateCouponDTO;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Class UpdateCouponRequest
 *
 * @package App\Modules\Coupon\Requests
 */
class UpdateCouponRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:200'],
            'description' => ['nullable', 'string', 'max:500'],
            'type' => ['sometimes', 'required', 'string', 'in:percentage,fixed_amount,free_shipping,buy_x_get_y'],
            'value' => ['sometimes', 'required', 'numeric', 'min:0'],
            'min_order_amount' => ['nullable', 'numeric', 'min:0'],
            'max_discount_amount' => ['nullable', 'numeric', 'min:0'],
            'usage_limit' => ['nullable', 'integer', 'min:1'],
            'usage_limit_per_user' => ['nullable', 'integer', 'min:1'],
            'starts_at' => ['nullable', 'date'],
            'expires_at' => ['nullable', 'date'],
            'is_active' => ['nullable', 'boolean'],
            'category_ids' => ['nullable', 'array'],
            'category_ids.*' => ['uuid', 'exists:categories,id'],
            'product_ids' => ['nullable', 'array'],
            'product_ids.*' => ['uuid', 'exists:products,id'],
            'rules' => ['nullable', 'array'],
            'rules.*.rule_type' => ['required', 'string', 'in:product,category,brand,customer_group,minimum_quantity'],
            'rules.*.rule_entity_id' => ['nullable', 'uuid'],
            'rules.*.rule_value' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function toDTO(): UpdateCouponDTO
    {
        return UpdateCouponDTO::fromArray($this->validated());
    }
}
