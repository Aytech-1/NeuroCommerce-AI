<?php

declare(strict_types=1);

namespace App\Modules\Notification\Database\Factories;

use App\Modules\Auth\Models\User;
use App\Modules\Notification\Enums\DeliveryStatus;
use App\Modules\Notification\Enums\NotificationChannel;
use App\Modules\Notification\Enums\NotificationType;
use App\Modules\Notification\Models\Notification;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Notification>
 */
class NotificationFactory extends Factory
{
    protected $model = Notification::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'type' => NotificationType::ORDER_CONFIRMATION->value,
            'channel' => NotificationChannel::DATABASE,
            'title' => fake()->sentence(4),
            'body' => fake()->paragraph(),
            'data' => [
                'order_number' => 'ORD-' . fake()->numerify('######'),
            ],
            'status' => DeliveryStatus::SENT,
            'read_at' => null,
            'sent_at' => now(),
        ];
    }

    public function unread(): static
    {
        return $this->state(fn (array $attributes) => [
            'read_at' => null,
            'status' => DeliveryStatus::SENT,
        ]);
    }

    public function read(): static
    {
        return $this->state(fn (array $attributes) => [
            'read_at' => now(),
            'status' => DeliveryStatus::READ,
        ]);
    }

    public function email(): static
    {
        return $this->state(fn (array $attributes) => [
            'channel' => NotificationChannel::EMAIL,
        ]);
    }

    public function sms(): static
    {
        return $this->state(fn (array $attributes) => [
            'channel' => NotificationChannel::SMS,
        ]);
    }
}
