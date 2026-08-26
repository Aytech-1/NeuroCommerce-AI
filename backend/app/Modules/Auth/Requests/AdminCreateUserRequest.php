<?php

declare(strict_types=1);

namespace App\Modules\Auth\Requests;

use App\Modules\Auth\Rules\StrongPasswordRule;
use App\Modules\Auth\Rules\ValidPhoneRule;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Class AdminCreateUserRequest
 *
 * @package App\Modules\Auth\Requests
 */
class AdminCreateUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        return $this->user() !== null && $this->user()->can('user.create');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'string', 'email:rfc', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', new StrongPasswordRule()],
            'user_type' => ['required', 'in:customer,staff,admin,super_admin'],
            'phone' => ['nullable', 'string', 'max:20', new ValidPhoneRule()],
            'is_active' => ['nullable', 'boolean'],
            'roles' => ['nullable', 'array'],
            'roles.*' => ['string', 'exists:roles,name'],
            'employee_id' => ['nullable', 'required_if:user_type,staff,admin', 'string', 'max:50', 'unique:staff_profiles,employee_id'],
            'department' => ['nullable', 'string', 'max:100'],
            'position' => ['nullable', 'string', 'max:100'],
            'customer_group' => ['nullable', 'in:regular,vip,wholesale'],
        ];
    }
}
