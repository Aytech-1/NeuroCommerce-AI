import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService, UserQueryParams } from "@/services/user-service";

export const USER_QUERY_KEYS = {
  users: (params: UserQueryParams) => ["admin", "users", params] as const,
  user: (id: string) => ["admin", "users", id] as const,
  roles: ["admin", "roles"] as const,
  role: (id: string) => ["admin", "roles", id] as const,
  permissions: ["admin", "permissions"] as const,
};

export function useUsers(params: UserQueryParams = {}) {
  return useQuery({
    queryKey: USER_QUERY_KEYS.users(params),
    queryFn: () => userService.getUsers(params),
    staleTime: 30 * 1000,
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: USER_QUERY_KEYS.user(id),
    queryFn: () => userService.getUser(id),
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}

export function useRoles() {
  return useQuery({
    queryKey: USER_QUERY_KEYS.roles,
    queryFn: () => userService.getRoles(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useRole(id: string) {
  return useQuery({
    queryKey: USER_QUERY_KEYS.role(id),
    queryFn: () => userService.getRole(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePermissions() {
  return useQuery({
    queryKey: USER_QUERY_KEYS.permissions,
    queryFn: () => userService.getPermissions(),
    staleTime: 10 * 60 * 1000,
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      userService.updateStatus(id, isActive),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.user(variables.id) });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => userService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useSyncRolePermissions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, permissions }: { id: string; permissions: string[] }) =>
      userService.syncPermissions(id, permissions),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.roles });
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.role(variables.id) });
    },
  });
}

export function useAssignUserRoles() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, roles }: { id: string; roles: string[] }) =>
      userService.assignRoles(id, roles),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.user(variables.id) });
    },
  });
}
