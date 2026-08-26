<?php

declare(strict_types=1);

namespace App\Modules\Notification\Requests;

use App\Modules\Notification\DTOs\BroadcastNotificationDTO;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Class BroadcastNotificationRequest
 *
 * @package App\Modules\Notification\Requests
 */
class BroadcastNotificationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string'],
            'channel' => ['nullable', 'string', 'in:email,sms,push,database'],
            'target_user_ids' => ['nullable', 'array'],
            'target_user_ids.*' => ['uuid', 'exists:users,id'],
            'data' => ['nullable', 'array'],
        ];
    }

    public function toDTO(): BroadcastNotificationDTO
    {
        return new BroadcastNotificationDTO(
            title: (string) $this->validated('title'),
            body: (string) $this->validated('body'),
            channel: (string) $this->input('channel', 'database'),
            targetUserIds: $this->validated('target_user_ids'),
            data: $this->validated('data')
        );
    }
}
