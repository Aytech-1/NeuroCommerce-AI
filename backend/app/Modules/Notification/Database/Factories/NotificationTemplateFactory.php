<?php

declare(strict_types=1);

namespace App\Modules\Notification\Database\Factories;

use App\Modules\Notification\Enums\NotificationChannel;
use App\Modules\Notification\Enums\NotificationType;
use App\Modules\Notification\Models\NotificationTemplate;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<NotificationTemplate>
 */
class NotificationTemplateFactory extends Factory
{
    protected $model = NotificationTemplate::class;

    public function definition(): array
    {
        return [
            'name' => fake()->unique()->slug(3),
            'channel' => NotificationChannel::EMAIL,
            'notification_type' => NotificationType::ORDER_CONFIRMATION->value,
            'subject' => 'Order Confirmation #{{ order_number }}',
            'body_template' => 'Hello {{ customer_name }}, thank you for order #{{ order_number }}.',
            'variables' => ['customer_name', 'order_number'],
            'is_active' => true,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
