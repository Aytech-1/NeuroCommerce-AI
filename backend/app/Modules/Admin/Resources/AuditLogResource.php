<?php

declare(strict_types=1);

namespace App\Modules\Admin\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Class AuditLogResource
 *
 * @package App\Modules\Admin\Resources
 */
class AuditLogResource extends JsonResource
{
    /**
     * Keys whose values should be redacted in audit diffs.
     *
     * @var array<string>
     */
    protected static array $sensitiveKeys = [
        'password',
        'password_hash',
        'password_confirmation',
        'secret',
        'stripe_secret_key',
        'stripe_webhook_secret',
        'token',
        'access_token',
        'refresh_token',
        'remember_token',
        'api_key',
        'cvv',
        'cvc',
        'card_number',
        'credit_card',
        'two_factor_secret',
        'two_factor_recovery_codes',
    ];

    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'user_id' => $this->user_id ? (string) $this->user_id : null,
            'user_type' => $this->user_type ? (string) $this->user_type : null,
            'user' => $this->whenLoaded('user', function () {
                return [
                    'id' => (string) $this->user->id,
                    'name' => "{$this->user->first_name} {$this->user->last_name}",
                    'email' => (string) $this->user->email,
                ];
            }),
            'event' => (string) $this->event,
            'auditable_type' => (string) $this->auditable_type,
            'auditable_id' => (string) $this->auditable_id,
            'old_values' => $this->sanitizeValues($this->old_values),
            'new_values' => $this->sanitizeValues($this->new_values),
            'url' => $this->url,
            'ip_address' => $this->ip_address,
            'user_agent' => $this->user_agent,
            'tags' => $this->tags,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }

    /**
     * Recursively sanitize sensitive fields in values array.
     */
    protected function sanitizeValues(mixed $values): mixed
    {
        if (!is_array($values)) {
            return $values;
        }

        $sanitized = [];
        foreach ($values as $key => $value) {
            if ($this->isSensitiveKey((string) $key)) {
                $sanitized[$key] = '[REDACTED]';
            } elseif (is_array($value)) {
                $sanitized[$key] = $this->sanitizeValues($value);
            } else {
                $sanitized[$key] = $value;
            }
        }

        return $sanitized;
    }

    /**
     * Determine if a given key is considered sensitive.
     */
    protected function isSensitiveKey(string $key): bool
    {
        $normalized = strtolower(str_replace(['-', ' '], '_', $key));
        foreach (self::$sensitiveKeys as $sensitive) {
            if (str_contains($normalized, $sensitive)) {
                return true;
            }
        }

        return false;
    }
}
