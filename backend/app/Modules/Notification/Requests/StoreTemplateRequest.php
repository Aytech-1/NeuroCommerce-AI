<?php

declare(strict_types=1);

namespace App\Modules\Notification\Requests;

use App\Modules\Notification\DTOs\CreateNotificationTemplateDTO;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Class StoreTemplateRequest
 *
 * @package App\Modules\Notification\Requests
 */
class StoreTemplateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100', 'unique:notif_templates,name'],
            'channel' => ['required', 'string', 'in:email,sms,push,database'],
            'notification_type' => ['required', 'string', 'max:100'],
            'subject' => ['nullable', 'string', 'max:255'],
            'body_template' => ['required', 'string'],
            'variables' => ['nullable', 'array'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }

    public function toDTO(): CreateNotificationTemplateDTO
    {
        return new CreateNotificationTemplateDTO(
            name: (string) $this->validated('name'),
            channel: (string) $this->validated('channel'),
            notificationType: (string) $this->validated('notification_type'),
            bodyTemplate: (string) $this->validated('body_template'),
            subject: $this->filled('subject') ? (string) $this->validated('subject') : null,
            variables: $this->validated('variables'),
            isActive: (bool) $this->input('is_active', true)
        );
    }
}
