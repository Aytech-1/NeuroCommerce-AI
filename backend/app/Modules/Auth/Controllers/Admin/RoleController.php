<?php

declare(strict_types=1);

namespace App\Modules\Auth\Controllers\Admin;

use App\Core\Helpers\ResponseHelper;
use App\Modules\Auth\Contracts\RoleServiceInterface;
use App\Modules\Auth\Models\Role;
use App\Modules\Auth\Requests\AdminStoreRoleRequest;
use App\Modules\Auth\Requests\AdminSyncPermissionsRequest;
use App\Modules\Auth\Requests\AdminUpdateRoleRequest;
use App\Modules\Auth\Resources\RoleResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Gate;

/**
 * Class RoleController
 *
 * Admin RBAC Role & Permission Management Controller.
 *
 * @package App\Modules\Auth\Controllers\Admin
 */
class RoleController extends Controller
{
    /**
     * RoleController constructor.
     *
     * @param RoleServiceInterface $roleService
     */
    public function __construct(
        protected readonly RoleServiceInterface $roleService
    ) {
    }

    /**
     * List all roles.
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        Gate::authorize('viewAny', Role::class);

        $roles = $this->roleService->listRoles();

        return ResponseHelper::success(RoleResource::collection($roles), 'Roles retrieved successfully.');
    }

    /**
     * Get role details.
     *
     * @param string $id
     * @return JsonResponse
     */
    public function show(string $id): JsonResponse
    {
        $role = $this->roleService->getRoleById($id);
        Gate::authorize('view', $role);

        return ResponseHelper::success(new RoleResource($role), 'Role details retrieved successfully.');
    }

    /**
     * Create a new role.
     *
     * @param AdminStoreRoleRequest $request
     * @return JsonResponse
     */
    public function store(AdminStoreRoleRequest $request): JsonResponse
    {
        Gate::authorize('create', Role::class);

        $role = $this->roleService->createRole($request->validated());

        return ResponseHelper::created(new RoleResource($role), 'Role created successfully.');
    }

    /**
     * Update an existing role.
     *
     * @param AdminUpdateRoleRequest $request
     * @param string $id
     * @return JsonResponse
     */
    public function update(AdminUpdateRoleRequest $request, string $id): JsonResponse
    {
        $role = $this->roleService->getRoleById($id);
        Gate::authorize('update', $role);

        $updatedRole = $this->roleService->updateRole($id, $request->validated());

        return ResponseHelper::success(new RoleResource($updatedRole), 'Role updated successfully.');
    }

    /**
     * Delete a non-system role.
     *
     * @param string $id
     * @return JsonResponse
     */
    public function destroy(string $id): JsonResponse
    {
        $role = $this->roleService->getRoleById($id);
        Gate::authorize('delete', $role);

        $this->roleService->deleteRole($id);

        return ResponseHelper::success(null, 'Role deleted successfully.');
    }

    /**
     * Sync permissions to role.
     *
     * @param AdminSyncPermissionsRequest $request
     * @param string $id
     * @return JsonResponse
     */
    public function syncPermissions(AdminSyncPermissionsRequest $request, string $id): JsonResponse
    {
        $role = $this->roleService->getRoleById($id);
        Gate::authorize('update', $role);

        $updatedRole = $this->roleService->syncPermissions($id, $request->validated('permissions'));

        return ResponseHelper::success(new RoleResource($updatedRole), 'Permissions synchronized successfully.');
    }

    /**
     * List all system permissions grouped by module.
     *
     * @return JsonResponse
     */
    public function permissions(): JsonResponse
    {
        Gate::authorize('viewAny', Role::class);

        $permissions = $this->roleService->listPermissionsGrouped();

        return ResponseHelper::success($permissions, 'Permissions retrieved successfully.');
    }
}
