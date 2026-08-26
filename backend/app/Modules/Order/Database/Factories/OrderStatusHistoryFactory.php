<?php

declare(strict_types=1);

namespace App\Modules\Order\Database\Factories;

use App\Modules\Auth\Models\User;
use App\Modules\Order\Enums\OrderStatus;
use App\Modules\Order\Models\Order;
use App\Modules\Order\Models\OrderStatusHistory;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * Class OrderStatusHistoryFactory
 *
 * @extends Factory<OrderStatusHistory>
 */
class OrderStatusHistoryFactory extends Factory
{
    protected $model = OrderStatusHistory::class;

    public function definition(): array
    {
        return [
            'id' => (string) Str::uuid(),
            'order_id' => Order::factory(),
            'from_status' => OrderStatus::PENDING->value,
            'to_status' => OrderStatus::PAID->value,
            'comment' => $this->faker->sentence(),
            'changed_by' => User::factory(),
            'created_at' => now(),
        ];
    }
}
