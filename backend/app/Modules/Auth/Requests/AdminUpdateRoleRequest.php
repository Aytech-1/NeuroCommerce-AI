<?php

declare(strict_types=1);

namespace App\Modules\Auth\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Class AdminUpdateRoleRequest
 *
 * @package App\Modules\Auth\Requests
 */
class AdminUpdateRoleRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        return $this->user() !== null && $this->user()->can('role.update');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        $roleId = (string) $this->route('id');

        return [
            'name' => ['sometimes', 'string', 'max:100', "unique:roles,name,{$roleId},id"],
            'description' => ['sometimes', 'nullable', 'string', 'max:500'],
        ];
    }
}
