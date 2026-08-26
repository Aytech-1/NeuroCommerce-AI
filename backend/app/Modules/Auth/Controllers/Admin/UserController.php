<?php

declare(strict_types=1);

namespace App\Modules\Auth\Controllers\Admin;

use App\Core\Helpers\ResponseHelper;
use App\Modules\Auth\Contracts\UserServiceInterface;
use App\Modules\Auth\Models\User;
use App\Modules\Auth\Requests\AdminAssignRoleRequest;
use App\Modules\Auth\Requests\AdminCreateUserRequest;
use App\Modules\Auth\Requests\AdminUpdateUserRequest;
use App\Modules\Auth\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Gate;

/**
 * Class UserController
 *
 * Admin User Management Controller.
 *
 * @package App\Modules\Auth\Controllers\Admin
 */
class UserController extends Controller
{
    /**
     * UserController constructor.
     *
     * @param UserServiceInterface $userService
     */
    public function __construct(
        protected readonly UserServiceInterface $userService
    ) {
    }

    /**
     * List all users.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', User::class);

        $filters = $request->only(['search', 'user_type', 'is_active', 'role', 'sort_by', 'sort_order']);
        $perPage = (int) $request->input('per_page', 20);

        $paginator = $this->userService->listUsers($filters, $perPage);

        return ResponseHelper::paginated($paginator, UserResource::class);
    }

    /**
     * Get user details.
     *
     * @param string $id
     * @return JsonResponse
     */
    public function show(string $id): JsonResponse
    {
        $user = $this->userService->getUserById($id);
        Gate::authorize('view', $user);

        return ResponseHelper::success(new UserResource($user), 'User details retrieved successfully.');
    }

    /**
     * Create a new user.
     *
     * @param AdminCreateUserRequest $request
     * @return JsonResponse
     */
    public function store(AdminCreateUserRequest $request): JsonResponse
    {
        Gate::authorize('create', User::class);

        $user = $this->userService->createUser($request->validated());

        return ResponseHelper::created(new UserResource($user), 'User created successfully.');
    }

    /**
     * Update user details.
     *
     * @param AdminUpdateUserRequest $request
     * @param string $id
     * @return JsonResponse
     */
    public function update(AdminUpdateUserRequest $request, string $id): JsonResponse
    {
        $user = $this->userService->getUserById($id);
        Gate::authorize('update', $user);

        $updatedUser = $this->userService->updateUser($id, $request->validated());

        return ResponseHelper::success(new UserResource($updatedUser), 'User updated successfully.');
    }

    /**
     * Soft delete user.
     *
     * @param string $id
     * @return JsonResponse
     */
    public function destroy(string $id): JsonResponse
    {
        $user = $this->userService->getUserById($id);
        Gate::authorize('delete', $user);

        $this->userService->deleteUser($id);

        return ResponseHelper::success(null, 'User deleted successfully.');
    }

    /**
     * Restore a soft-deleted user.
     *
     * @param string $id
     * @return JsonResponse
     */
    public function restore(string $id): JsonResponse
    {
        Gate::authorize('create', User::class);

        $this->userService->restoreUser($id);

        return ResponseHelper::success(null, 'User restored successfully.');
    }

    /**
     * Update user active status.
     *
     * @param Request $request
     * @param string $id
     * @return JsonResponse
     */
    public function updateStatus(Request $request, string $id): JsonResponse
    {
        $user = $this->userService->getUserById($id);
        Gate::authorize('update', $user);

        $request->validate(['is_active' => ['required', 'boolean']]);
        $updatedUser = $this->userService->updateStatus($id, (bool) $request->input('is_active'));

        return ResponseHelper::success(new UserResource($updatedUser), 'User status updated successfully.');
    }

    /**
     * Assign roles to a user.
     *
     * @param AdminAssignRoleRequest $request
     * @param string $id
     * @return JsonResponse
     */
    public function assignRoles(AdminAssignRoleRequest $request, string $id): JsonResponse
    {
        $user = $this->userService->getUserById($id);
        Gate::authorize('update', $user);

        $updatedUser = $this->userService->assignRoles($id, $request->validated('roles'));

        return ResponseHelper::success(new UserResource($updatedUser), 'Roles assigned successfully.');
    }

    /**
     * Remove a role from a user.
     *
     * @param string $id
     * @param string $role
     * @return JsonResponse
     */
    public function removeRole(string $id, string $role): JsonResponse
    {
        $user = $this->userService->getUserById($id);
        Gate::authorize('update', $user);

        $updatedUser = $this->userService->removeRole($id, $role);

        return ResponseHelper::success(new UserResource($updatedUser), 'Role removed successfully.');
    }
}
