<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * The API health endpoint returns a successful response.
     */
    public function test_the_api_health_endpoint_returns_a_successful_response(): void
    {
        $response = $this->getJson('/api/v1/health');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'status' => 'healthy',
                ],
            ]);
    }

    /**
     * The API version endpoint returns correct version information.
     */
    public function test_the_api_version_endpoint_returns_version_info(): void
    {
        $response = $this->getJson('/api/v1/version');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'name' => 'NeuroCommerce AI',
                    'version' => '1.0.0',
                ],
            ]);
    }

    /**
     * Nonexistent API routes return proper 404 error envelope.
     */
    public function test_nonexistent_api_route_returns_404_envelope(): void
    {
        $response = $this->getJson('/api/v1/nonexistent');

        $response->assertStatus(404)
            ->assertJson([
                'success' => false,
                'code' => 'NOT_FOUND',
            ])
            ->assertJsonStructure([
                'success',
                'message',
                'data',
                'code',
                'trace_id',
            ]);
    }
}
