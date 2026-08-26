import { apiClient } from "@/lib/api/client";
import { ApiResponse, PaginationMeta } from "@/types/api";

export interface AuditLogItem {
  id: string;
  user_id: string;
  user?: {
    id: string;
    name: string;
    email: string;
  } | null;
  event: string;
  auditable_type: string;
  auditable_id: string;
  old_values?: Record<string, unknown> | null;
  new_values?: Record<string, unknown> | null;
  ip_address?: string | null;
  user_agent?: string | null;
  tags?: string[] | null;
  created_at: string;
}

export interface ActivityLogItem {
  id: string;
  user_id: string;
  user?: {
    id: string;
    name: string;
    email: string;
  } | null;
  action: string;
  description: string;
  properties?: Record<string, unknown> | null;
  ip_address?: string | null;
  created_at: string;
}

export interface AuditQueryParams {
  page?: number;
  per_page?: number;
  event?: string;
  auditable_type?: string;
  user_id?: string;
}

export const auditService = {
  async getAuditLogs(params: AuditQueryParams = {}): Promise<{ data: AuditLogItem[]; meta?: PaginationMeta }> {
    const queryParams: Record<string, unknown> = {
      page: params.page,
      per_page: params.per_page,
    };

    if (params.event) queryParams["filter[event]"] = params.event;
    if (params.auditable_type) queryParams["filter[auditable_type]"] = params.auditable_type;
    if (params.user_id) queryParams["filter[user_id]"] = params.user_id;

    const response = await apiClient.get<ApiResponse<AuditLogItem[]>>("/admin/audit-logs", {
      params: queryParams,
    });

    return {
      data: response.data.data,
      meta: response.data.meta,
    };
  },

  async getAuditLog(id: string): Promise<AuditLogItem> {
    const response = await apiClient.get<ApiResponse<AuditLogItem>>(`/admin/audit-logs/${id}`);
    return response.data.data;
  },

  async getActivityLogs(
    params: { page?: number; per_page?: number; action?: string } = {}
  ): Promise<{ data: ActivityLogItem[]; meta?: PaginationMeta }> {
    const queryParams: Record<string, unknown> = {
      page: params.page,
      per_page: params.per_page,
    };
    if (params.action) queryParams["filter[action]"] = params.action;

    const response = await apiClient.get<ApiResponse<ActivityLogItem[]>>("/admin/activity-logs", {
      params: queryParams,
    });

    return {
      data: response.data.data,
      meta: response.data.meta,
    };
  },

  async getUserActivityLogs(
    userId: string,
    params: { page?: number; per_page?: number } = {}
  ): Promise<{ data: ActivityLogItem[]; meta?: PaginationMeta }> {
    const response = await apiClient.get<ApiResponse<ActivityLogItem[]>>(
      `/admin/activity-logs/user/${encodeURIComponent(userId)}`,
      { params }
    );

    return {
      data: response.data.data,
      meta: response.data.meta,
    };
  },
};
