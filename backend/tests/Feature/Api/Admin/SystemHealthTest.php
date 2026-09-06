<?php

declare(strict_types=1);

namespace Tests\Feature\Api\Admin;

use App\Modules\Auth\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SystemHealthTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $customer;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);

        $this->admin = User::factory()->admin()->create();
        $this->admin->givePermissionTo("dashboard.view");

        $this->customer = User::factory()->create();
    }

    public function test_authorized_admin_can_retrieve_authoritative_system_health(): void
    {
        Sanctum::actingAs($this->admin, ["*"]);

        $response = $this->getJson("/api/v1/admin/system-health");

        $response->assertStatus(200)
            ->assertJsonPath("success", true)
            ->assertJsonStructure([
                "success",
                "message",
                "data" => [
                    "status",
                    "checked_at",
                    "application" => [
                        "status",
                        "name",
                        "version",
                        "environment",
                        "debug_mode",
                        "laravel_version",
                        "php_version",
                    ],
                    "database" => [
                        "status",
                        "connection",
                        "database_name",
                        "response_time_ms",
                    ],
                    "cache" => [
                        "status",
                        "driver",
                        "response_time_ms",
                    ],
                    "queue" => [
                        "status",
                        "driver",
                        "worker_status",
                    ],
                    "storage" => [
                        "status",
                        "disk",
                        "writable",
                    ],
                    "external_services",
                    "security_warnings",
                ],
            ]);

        $data = $response->json("data");
        $this->assertContains($data["status"], ["healthy", "degraded", "unhealthy"]);
        $this->assertEquals("healthy", $data["database"]["status"]);
        $this->assertIsNumeric($data["database"]["response_time_ms"]);
    }

    public function test_unauthorized_customer_cannot_retrieve_system_health(): void
    {
        Sanctum::actingAs($this->customer, ["*"]);

        $response = $this->getJson("/api/v1/admin/system-health");

        $response->assertStatus(403);
    }

    public function test_unauthenticated_request_is_rejected(): void
    {
        $response = $this->getJson("/api/v1/admin/system-health");

        $response->assertStatus(401);
    }

    public function test_system_health_never_exposes_secrets(): void
    {
        Sanctum::actingAs($this->admin, ["*"]);

        $response = $this->getJson("/api/v1/admin/system-health");

        $content = $response->getContent();
        $this->assertStringNotContainsString("base64:", $content);
        $this->assertStringNotContainsString("DB_PASSWORD", $content);
        $this->assertStringNotContainsString("REDIS_PASSWORD", $content);
        $this->assertStringNotContainsString("STRIPE_SECRET_KEY", $content);
    }
}