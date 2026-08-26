<?php

declare(strict_types=1);

namespace App\Modules\Auth\Requests;

use App\Modules\Auth\Rules\ValidPhoneRule;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Class AdminUpdateUserRequest
 *
 * @package App\Modules\Auth\Requests
 */
class AdminUpdateUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        return $this->user() !== null && $this->user()->can('user.update');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        $userId = (string) $this->route('id');

        return [
            'first_name' => ['sometimes', 'string', 'max:100'],
            'last_name' => ['sometimes', 'string', 'max:100'],
            'email' => ['sometimes', 'string', 'email', 'max:255', "unique:users,email,{$userId},id"],
            'phone' => ['sometimes', 'nullable', 'string', 'max:20', new ValidPhoneRule()],
            'user_type' => ['sometimes', 'in:customer,staff,admin,super_admin'],
            'is_active' => ['sometimes', 'boolean'],
            'locale' => ['sometimes', 'nullable', 'string', 'max:10'],
            'timezone' => ['sometimes', 'nullable', 'string', 'max:50'],
            'department' => ['sometimes', 'nullable', 'string', 'max:100'],
            'position' => ['sometimes', 'nullable', 'string', 'max:100'],
            'customer_group' => ['sometimes', 'nullable', 'in:regular,vip,wholesale'],
            'loyalty_points' => ['sometimes', 'nullable', 'integer', 'min:0'],
        ];
    }
}
