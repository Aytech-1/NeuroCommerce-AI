<?php

declare(strict_types=1);

namespace App\Modules\Notification\Requests;

use App\Modules\Notification\DTOs\UpdateNotificationTemplateDTO;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Class UpdateTemplateRequest
 *
 * @package App\Modules\Notification\Requests
 */
class UpdateTemplateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        $id = $this->route('id');

        return [
            'name' => ['sometimes', 'string', 'max:100', "unique:notif_templates,name,{$id},id"],
            'channel' => ['sometimes', 'string', 'in:email,sms,push,database'],
            'notification_type' => ['sometimes', 'string', 'max:100'],
            'subject' => ['nullable', 'string', 'max:255'],
            'body_template' => ['sometimes', 'string'],
            'variables' => ['nullable', 'array'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }

    public function toDTO(): UpdateNotificationTemplateDTO
    {
        return new UpdateNotificationTemplateDTO(
            name: $this->has('name') ? (string) $this->input('name') : null,
            channel: $this->has('channel') ? (string) $this->input('channel') : null,
            notificationType: $this->has('notification_type') ? (string) $this->input('notification_type') : null,
            bodyTemplate: $this->has('body_template') ? (string) $this->input('body_template') : null,
            subject: $this->has('subject') ? ($this->filled('subject') ? (string) $this->input('subject') : null) : null,
            variables: $this->input('variables'),
            isActive: $this->has('is_active') ? (bool) $this->input('is_active') : null
        );
    }
}
