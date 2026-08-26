<?php

declare(strict_types=1);

namespace Tests\Feature\Api\Shipping;

use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ShippingRateCalculationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_public_user_can_calculate_shipping_rates_for_us(): void
    {
        $response = $this->postJson('/api/v1/checkout/shipping-rates', [
            'country_code' => 'US',
            'weight' => 2.5,
            'order_amount' => 50.0,
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    '*' => [
                        'id',
                        'zone_id',
                        'carrier',
                        'service_level',
                        'rate',
                        'currency_code',
                        'estimated_days_min',
                        'estimated_days_max',
                    ],
                ],
            ]);

        $rates = $response->json('data');
        $this->assertNotEmpty($rates);
        $this->assertEquals('mock_carrier', $rates[0]['carrier']);
    }

    public function test_shipping_rates_for_unsupported_country_returns_empty(): void
    {
        $response = $this->postJson('/api/v1/checkout/shipping-rates', [
            'country_code' => 'ZZ',
            'weight' => 1.0,
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data', []);
    }
}
