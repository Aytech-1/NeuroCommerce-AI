<?php

declare(strict_types=1);

namespace App\Modules\Notification\Requests;

use App\Modules\Notification\DTOs\UpdateNotificationPreferencesDTO;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Class UpdatePreferencesRequest
 *
 * @package App\Modules\Notification\Requests
 */
class UpdatePreferencesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'preferences' => ['required', 'array', 'min:1'],
            'preferences.*.channel' => ['required', 'string', 'in:email,sms,push,database'],
            'preferences.*.notification_type' => ['required', 'string', 'max:100'],
            'preferences.*.is_enabled' => ['required', 'boolean'],
        ];
    }

    public function toDTO(): UpdateNotificationPreferencesDTO
    {
        return new UpdateNotificationPreferencesDTO(
            preferences: $this->validated('preferences')
        );
    }
}
