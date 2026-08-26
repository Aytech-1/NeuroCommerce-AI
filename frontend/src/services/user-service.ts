import { apiClient } from "@/lib/api/client";
import { ApiResponse, PaginationMeta } from "@/types/api";

export interface UserAddress {
  id?: string;
  first_name?: string;
  last_name?: string;
  address_line_1?: string;
  address_line_2?: string | null;
  city?: string;
  state?: string | null;
  postal_code?: string;
  country_code?: string;
  phone?: string | null;
  is_default?: boolean;
}

export interface UserItem {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  user_type: "customer" | "staff" | "admin" | "super_admin";
  is_active: boolean;
  email_verified_at?: string | null;
  last_login_at?: string | null;
  created_at: string;
  roles?: string[];
  permissions?: string[];
  profile?: {
    employee_id?: string;
    department?: string;
    position?: string;
    customer_group?: string;
    total_spent?: number;
    total_orders?: number;
  } | null;
}

export interface UserDetail extends UserItem {
  locale?: string;
  currency_code?: string;
  timezone?: string;
  addresses?: UserAddress[];
}

export interface PermissionItem {
  id: string;
  name: string;
  guard_name: string;
  group?: string;
  description?: string;
}

export interface RoleItem {
  id: string;
  name: string;
  guard_name: string;
  description?: string | null;
  is_system?: boolean;
  users_count?: number;
  permissions_count?: number;
  permissions?: PermissionItem[] | string[];
}

export interface RoleDetail extends RoleItem {
  permissions: PermissionItem[];
}

export interface UserQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  user_type?: string;
  is_active?: boolean | string;
  role?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export const userService = {
  async getUsers(params: UserQueryParams = {}): Promise<{ data: UserItem[]; meta?: PaginationMeta }> {
    const response = await apiClient.get<ApiResponse<UserItem[]>>("/admin/users", { params });
    return {
      data: response.data.data,
      meta: response.data.meta,
    };
  },

  async getUser(id: string): Promise<UserDetail> {
    const response = await apiClient.get<ApiResponse<UserDetail>>(`/admin/users/${id}`);
    return response.data.data;
  },

  async createUser(data: Record<string, unknown>): Promise<UserDetail> {
    const response = await apiClient.post<ApiResponse<UserDetail>>("/admin/users", data);
    return response.data.data;
  },

  async updateUser(id: string, data: Record<string, unknown>): Promise<UserDetail> {
    const response = await apiClient.put<ApiResponse<UserDetail>>(`/admin/users/${id}`, data);
    return response.data.data;
  },

  async updateStatus(id: string, isActive: boolean): Promise<UserDetail> {
    const response = await apiClient.patch<ApiResponse<UserDetail>>(`/admin/users/${id}/status`, {
      is_active: isActive,
    });
    return response.data.data;
  },

  async deleteUser(id: string): Promise<void> {
    await apiClient.delete<ApiResponse<null>>(`/admin/users/${id}`);
  },

  async assignRoles(id: string, roles: string[]): Promise<UserDetail> {
    const response = await apiClient.post<ApiResponse<UserDetail>>(`/admin/users/${id}/roles`, {
      roles,
    });
    return response.data.data;
  },

  async getRoles(): Promise<RoleItem[]> {
    const response = await apiClient.get<ApiResponse<RoleItem[]>>("/admin/roles");
    return response.data.data;
  },

  async getRole(id: string): Promise<RoleDetail> {
    const response = await apiClient.get<ApiResponse<RoleDetail>>(`/admin/roles/${id}`);
    return response.data.data;
  },

  async createRole(data: Partial<RoleItem>): Promise<RoleDetail> {
    const response = await apiClient.post<ApiResponse<RoleDetail>>("/admin/roles", data);
    return response.data.data;
  },

  async updateRole(id: string, data: Partial<RoleItem>): Promise<RoleDetail> {
    const response = await apiClient.put<ApiResponse<RoleDetail>>(`/admin/roles/${id}`, data);
    return response.data.data;
  },

  async syncPermissions(id: string, permissions: string[]): Promise<RoleDetail> {
    const response = await apiClient.put<ApiResponse<RoleDetail>>(`/admin/roles/${id}/permissions`, {
      permissions,
    });
    return response.data.data;
  },

  async getPermissions(): Promise<PermissionItem[]> {
    const response = await apiClient.get<ApiResponse<PermissionItem[]>>("/admin/permissions");
    return response.data.data;
  },
};
