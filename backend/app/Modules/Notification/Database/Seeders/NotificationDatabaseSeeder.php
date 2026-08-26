<?php

declare(strict_types=1);

namespace App\Modules\Notification\Database\Seeders;

use App\Modules\Notification\Enums\NotificationChannel;
use App\Modules\Notification\Enums\NotificationType;
use App\Modules\Notification\Models\NotificationTemplate;
use Illuminate\Database\Seeder;

/**
 * Class NotificationDatabaseSeeder
 *
 * @package App\Modules\Notification\Database\Seeders
 */
class NotificationDatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $templates = [
            [
                'name' => 'order_confirmation_email',
                'channel' => NotificationChannel::EMAIL,
                'notification_type' => NotificationType::ORDER_CONFIRMATION->value,
                'subject' => 'NeuroCommerce AI - Order Confirmation #{{ order_number }}',
                'body_template' => 'Hello {{ customer_name }}, thank you for your order #{{ order_number }} for {{ currency }} {{ grand_total }}. We are processing your items and will notify you when shipped.',
                'variables' => ['customer_name', 'order_number', 'currency', 'grand_total'],
                'is_active' => true,
            ],
            [
                'name' => 'order_shipped_email',
                'channel' => NotificationChannel::EMAIL,
                'notification_type' => NotificationType::ORDER_SHIPPED->value,
                'subject' => 'Your Order #{{ order_number }} is on its way!',
                'body_template' => 'Hello {{ customer_name }}, your order #{{ order_number }} has been shipped via {{ carrier }}. Tracking Number: {{ tracking_number }}. Track your package: {{ tracking_url }}',
                'variables' => ['customer_name', 'order_number', 'carrier', 'tracking_number', 'tracking_url'],
                'is_active' => true,
            ],
            [
                'name' => 'user_welcome_email',
                'channel' => NotificationChannel::EMAIL,
                'notification_type' => NotificationType::USER_REGISTERED->value,
                'subject' => 'Welcome to NeuroCommerce AI, {{ customer_name }}!',
                'body_template' => 'Welcome {{ customer_name }}! Explore our AI-driven catalog with personalized product recommendations tailored just for you.',
                'variables' => ['customer_name', 'email'],
                'is_active' => true,
            ],
            [
                'name' => 'abandoned_cart_email',
                'channel' => NotificationChannel::EMAIL,
                'notification_type' => NotificationType::ABANDONED_CART->value,
                'subject' => 'Complete your purchase — your cart is waiting!',
                'body_template' => 'Hello {{ customer_name }}, you left {{ item_count }} item(s) in your shopping cart. Return to checkout: {{ cart_url }}',
                'variables' => ['customer_name', 'item_count', 'cart_url'],
                'is_active' => true,
            ],
        ];

        foreach ($templates as $data) {
            NotificationTemplate::firstOrCreate(
                ['name' => $data['name']],
                $data
            );
        }
    }
}
