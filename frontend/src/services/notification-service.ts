import { apiClient } from "@/lib/api/client";
import { ApiResponse } from "@/types/api";

export type NotificationChannelType = "email" | "sms" | "push" | "database";
export type DeliveryStatusType = "pending" | "sent" | "failed" | "read";

export interface AdminNotificationItem {
  id: string;
  type: string;
  title: string;
  body: string | null;
  data: Record<string, unknown> | null;
  read_at: string | null;
  created_at: string;
}

export interface NotificationTemplateItem {
  id: string;
  name: string;
  channel: NotificationChannelType;
  notification_type: string;
  subject: string | null;
  body_template: string;
  variables: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateTemplatePayload {
  name: string;
  channel: NotificationChannelType;
  notification_type: string;
  subject?: string | null;
  body_template: string;
  variables?: string[];
  is_active?: boolean;
}

export interface UpdateTemplatePayload {
  name?: string;
  channel?: NotificationChannelType;
  notification_type?: string;
  subject?: string | null;
  body_template?: string;
  variables?: string[];
  is_active?: boolean;
}

export interface BroadcastNotificationPayload {
  title: string;
  body: string;
  channel?: NotificationChannelType;
  target_user_ids?: string[];
  data?: Record<string, unknown>;
}

export interface BroadcastResult {
  dispatched_count: number;
}

export interface UnreadCountResponse {
  unread_count: number;
}

export interface NotificationQueryParams {
  page?: number;
  per_page?: number;
}

export interface TemplateQueryParams {
  page?: number;
  per_page?: number;
  channel?: string;
  notification_type?: string;
  is_active?: boolean;
  search?: string;
}

export const notificationService = {
  // Admin In-App Notifications
  async getAdminNotifications(params?: NotificationQueryParams): Promise<ApiResponse<AdminNotificationItem[]>> {
    const response = await apiClient.get<ApiResponse<AdminNotificationItem[]>>("/admin/notifications", {
      params,
    });
    return response.data;
  },

  async getAdminUnreadCount(): Promise<UnreadCountResponse> {
    const response = await apiClient.get<ApiResponse<UnreadCountResponse>>("/admin/notifications/unread-count");
    return response.data.data;
  },

  async markAsRead(id: string): Promise<AdminNotificationItem> {
    const response = await apiClient.patch<ApiResponse<AdminNotificationItem>>(`/admin/notifications/${id}/read`);
    return response.data.data;
  },

  async markAllAsRead(): Promise<void> {
    await apiClient.post("/admin/notifications/mark-all-read");
  },

  // Templates CRUD
  async getTemplates(params?: TemplateQueryParams): Promise<ApiResponse<NotificationTemplateItem[]>> {
    const response = await apiClient.get<ApiResponse<NotificationTemplateItem[]>>("/admin/notifications/templates", {
      params,
    });
    return response.data;
  },

  async getTemplate(id: string): Promise<NotificationTemplateItem> {
    const response = await apiClient.get<ApiResponse<NotificationTemplateItem>>(`/admin/notifications/templates/${id}`);
    return response.data.data;
  },

  async createTemplate(payload: CreateTemplatePayload): Promise<NotificationTemplateItem> {
    const response = await apiClient.post<ApiResponse<NotificationTemplateItem>>("/admin/notifications/templates", payload);
    return response.data.data;
  },

  async updateTemplate(id: string, payload: UpdateTemplatePayload): Promise<NotificationTemplateItem> {
    const response = await apiClient.put<ApiResponse<NotificationTemplateItem>>(`/admin/notifications/templates/${id}`, payload);
    return response.data.data;
  },

  async deleteTemplate(id: string): Promise<void> {
    await apiClient.delete(`/admin/notifications/templates/${id}`);
  },

  // Broadcast Dispatch
  async broadcastNotification(payload: BroadcastNotificationPayload): Promise<BroadcastResult> {
    const response = await apiClient.post<ApiResponse<BroadcastResult>>("/admin/notifications/send", payload);
    return response.data.data;
  },
};
