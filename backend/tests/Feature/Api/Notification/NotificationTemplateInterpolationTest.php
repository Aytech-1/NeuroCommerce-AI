<?php

declare(strict_types=1);

namespace Tests\Feature\Api\Notification;

use App\Modules\Notification\Services\NotificationTemplateService;
use Tests\TestCase;

class NotificationTemplateInterpolationTest extends TestCase
{
    public function test_template_variables_are_correctly_interpolated(): void
    {
        $service = app(NotificationTemplateService::class);

        $template = 'Hello {{ customer_name }}, your order #{{ order_number }} total is {{ total }}.';
        $variables = [
            'customer_name' => 'Alice Johnson',
            'order_number' => 'ORD-100200',
            'total' => '$150.00',
        ];

        $rendered = $service->render($template, $variables);

        $this->assertEquals(
            'Hello Alice Johnson, your order #ORD-100200 total is $150.00.',
            $rendered
        );
    }

    public function test_html_in_template_variables_is_safely_escaped(): void
    {
        $service = app(NotificationTemplateService::class);

        $template = 'Hello {{ customer_name }}, check your balance.';
        $variables = [
            'customer_name' => '<script>alert("xss")</script>',
        ];

        $rendered = $service->render($template, $variables);

        $this->assertStringNotContainsString('<script>', $rendered);
        $this->assertStringContainsString('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;', $rendered);
    }
}
