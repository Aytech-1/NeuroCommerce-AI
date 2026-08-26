<?php

declare(strict_types=1);

namespace App\Modules\CMS\Requests;

use App\Modules\CMS\DTOs\ContactMessageDTO;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Class ContactFormRequest
 *
 * @package App\Modules\CMS\Requests
 */
class ContactFormRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'subject' => ['required', 'string', 'max:255'],
            'message' => ['required', 'string', 'max:5000'],
            'phone' => ['nullable', 'string', 'max:50'],
        ];
    }

    public function toDTO(): ContactMessageDTO
    {
        return ContactMessageDTO::fromRequest($this);
    }
}
