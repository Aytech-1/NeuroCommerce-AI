<?php

declare(strict_types=1);

namespace Tests\Feature\Api\Security;

use App\Modules\Auth\Models\Address;
use App\Modules\Auth\Models\User;
use App\Modules\CMS\Services\MediaService;
use App\Modules\Order\Enums\OrderStatus;
use App\Modules\Order\Models\Order;
use App\Modules\Payment\Models\Payment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use PHPUnit\Framework\Attributes\Test;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class FinalSecurityForensicAuditTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        RateLimiter::clear('test-ip');
    }

    #[Test]
    public function unauthenticated_requests_to_protected_endpoints_return_401(): void
    {
        $endpoints = [
            '/api/v1/auth/me',
            '/api/v1/addresses',
            '/api/v1/customer/orders',
            '/api/v1/customer/wishlist',
            '/api/v1/admin/dashboard/summary',
            '/api/v1/admin/users',
            '/api/v1/admin/roles',
            '/api/v1/admin/audit-logs',
            '/api/v1/admin/system-health',
            '/api/v1/admin/settings',
        ];

        foreach ($endpoints as $uri) {
            $response = $this->getJson($uri);
            $response->assertStatus(401)
                ->assertJsonStructure([
                    'success',
                    'message',
                ]);
            $this->assertFalse($response->json('success'));
        }
    }

    #[Test]
    public function customer_access_to_admin_endpoints_returns_403_forbidden(): void
    {
        $customer = User::factory()->create([
            'user_type' => 'customer',
            'is_active' => true,
        ]);

        Sanctum::actingAs($customer, ['*']);

        $adminEndpoints = [
            '/api/v1/admin/dashboard/summary',
            '/api/v1/admin/users',
            '/api/v1/admin/roles',
            '/api/v1/admin/audit-logs',
            '/api/v1/admin/system-health',
            '/api/v1/admin/settings',
        ];

        foreach ($adminEndpoints as $uri) {
            $response = $this->getJson($uri);
            $response->assertStatus(403)
                ->assertJson([
                    'success' => false,
                    'code' => 'FORBIDDEN',
                ]);
        }
    }

    #[Test]
    public function deactivated_users_are_blocked_by_active_middleware(): void
    {
        $inactiveUser = User::factory()->create([
            'user_type' => 'customer',
            'is_active' => false,
        ]);

        Sanctum::actingAs($inactiveUser, ['*']);

        $response = $this->getJson('/api/v1/auth/me');
        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'code' => 'FORBIDDEN',
            ]);
    }

    #[Test]
    public function idor_order_isolation_prevents_customer_from_viewing_another_customers_order(): void
    {
        $customerA = User::factory()->create(['user_type' => 'customer', 'is_active' => true]);
        $customerB = User::factory()->create(['user_type' => 'customer', 'is_active' => true]);

        $orderB = Order::factory()->create([
            'user_id' => $customerB->id,
            'status' => OrderStatus::PENDING,
        ]);

        Sanctum::actingAs($customerA, ['*']);

        $response = $this->getJson("/api/v1/customer/orders/{$orderB->id}");
        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'code' => 'FORBIDDEN',
            ]);
    }

    #[Test]
    public function idor_address_isolation_prevents_customer_from_accessing_another_customers_address(): void
    {
        $customerA = User::factory()->create(['user_type' => 'customer', 'is_active' => true]);
        $customerB = User::factory()->create(['user_type' => 'customer', 'is_active' => true]);

        $addressB = Address::factory()->create([
            'addressable_type' => User::class,
            'addressable_id' => $customerB->id,
        ]);

        Sanctum::actingAs($customerA, ['*']);

        $response = $this->getJson("/api/v1/addresses/{$addressB->id}");
        $response->assertStatus(404); // Scoped query returns 404 EntityNotFoundException
    }

    #[Test]
    public function sensitive_attributes_are_never_exposed_in_serialized_user_json(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('SecretPassword123!'),
            'two_factor_secret' => 'encrypted_secret_payload',
            'remember_token' => Str::random(10),
            'is_active' => true,
        ]);

        Sanctum::actingAs($user, ['*']);

        $response = $this->getJson('/api/v1/auth/me');
        $response->assertStatus(200);

        $json = $response->json();
        $this->assertArrayNotHasKey('password', $json['data']);
        $this->assertArrayNotHasKey('two_factor_secret', $json['data']);
        $this->assertArrayNotHasKey('remember_token', $json['data']);
    }

    #[Test]
    public function customer_cannot_elevate_privileges_via_profile_update(): void
    {
        $customer = User::factory()->create([
            'user_type' => 'customer',
            'is_active' => true,
        ]);

        Sanctum::actingAs($customer, ['*']);

        $response = $this->putJson('/api/v1/auth/me', [
            'first_name' => 'Hacker',
            'last_name' => 'Customer',
            'user_type' => 'super_admin',
            'is_active' => false,
        ]);

        $response->assertStatus(200);
        $customer->refresh();

        $this->assertSame('customer', $customer->user_type);
        $this->assertTrue((bool) $customer->is_active);
    }

    #[Test]
    public function audit_logs_cannot_be_mutated_or_deleted_via_api(): void
    {
        $admin = User::factory()->create([
            'user_type' => 'super_admin',
            'is_active' => true,
        ]);

        Sanctum::actingAs($admin, ['*']);

        $postRes = $this->postJson('/api/v1/admin/audit-logs', ['action' => 'fake']);
        $this->assertTrue(in_array($postRes->status(), [404, 405], true));

        $putRes = $this->putJson('/api/v1/admin/audit-logs/some-id', ['action' => 'tamper']);
        $this->assertTrue(in_array($putRes->status(), [404, 405], true));

        $delRes = $this->deleteJson('/api/v1/admin/audit-logs/some-id');
        $this->assertTrue(in_array($delRes->status(), [404, 405], true));
    }

    #[Test]
    public function webhook_endpoint_rejects_requests_with_invalid_signature(): void
    {
        $response = $this->postJson('/api/v1/webhooks/stripe', [
            'id' => 'evt_test_123',
            'type' => 'payment_intent.succeeded',
        ], [
            'Stripe-Signature' => 't=' . time() . ',v1=invalid_fake_signature',
        ]);

        $response->assertStatus(400)
            ->assertJson([
                'success' => false,
                'code' => 'INVALID_WEBHOOK_SIGNATURE',
            ]);
    }

    #[Test]
    public function svg_upload_sanitizes_malicious_script_tags(): void
    {
        Config::set('filesystems.default', 'public');
        Storage::fake('public');

        $maliciousSvg = <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="40" stroke="green" stroke-width="4" fill="yellow" />
    <script type="text/javascript">alert('XSS');</script>
    <a href="javascript:alert(1)"><text x="10" y="20">Click</text></a>
</svg>
SVG;

        $file = UploadedFile::fake()->createWithContent('malicious.svg', $maliciousSvg);

        /** @var MediaService $mediaService */
        $mediaService = app(MediaService::class);
        $mediaFile = $mediaService->uploadFile($file, 'Malicious SVG Test');

        $storedContent = Storage::disk($mediaFile->disk)->get($mediaFile->path);

        $this->assertNotNull($storedContent);
        $this->assertStringNotContainsString('<script', $storedContent);
        $this->assertStringNotContainsString('javascript:', $storedContent);
    }

    #[Test]
    public function rate_limiter_blocks_excessive_attempts_with_429(): void
    {
        for ($i = 0; $i < 10; $i++) {
            RateLimiter::hit('test-rate-limit-key', 60);
        }

        $this->assertTrue(RateLimiter::tooManyAttempts('test-rate-limit-key', 10));
        $this->assertGreaterThanOrEqual(1, RateLimiter::availableIn('test-rate-limit-key'));
    }
}
