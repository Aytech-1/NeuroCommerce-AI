import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  notificationService,
  NotificationQueryParams,
  TemplateQueryParams,
  CreateTemplatePayload,
  UpdateTemplatePayload,
  BroadcastNotificationPayload,
  AdminNotificationItem,
  NotificationTemplateItem,
  UnreadCountResponse,
} from "@/services/notification-service";
import { ApiResponse } from "@/types/api";

export const ADMIN_NOTIFICATION_QUERY_KEYS = {
  notifications: (params?: NotificationQueryParams) => ["admin", "notifications", params] as const,
  unreadCount: () => ["admin", "notifications", "unread-count"] as const,
  templates: (params?: TemplateQueryParams) => ["admin", "notification-templates", params] as const,
  template: (id: string) => ["admin", "notification-template", id] as const,
};

export function useAdminNotifications(params?: NotificationQueryParams, options?: { enabled?: boolean }) {
  return useQuery<ApiResponse<AdminNotificationItem[]>, Error>({
    queryKey: ADMIN_NOTIFICATION_QUERY_KEYS.notifications(params),
    queryFn: () => notificationService.getAdminNotifications(params),
    staleTime: 30 * 1000,
    ...options,
  });
}

export function useAdminUnreadCount(options?: { enabled?: boolean }) {
  return useQuery<UnreadCountResponse, Error>({
    queryKey: ADMIN_NOTIFICATION_QUERY_KEYS.unreadCount(),
    queryFn: () => notificationService.getAdminUnreadCount(),
    staleTime: 30 * 1000,
    ...options,
  });
}

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "notifications"] });
    },
  });
}

export function useMarkAllNotificationsReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "notifications"] });
    },
  });
}

export function useNotificationTemplates(params?: TemplateQueryParams, options?: { enabled?: boolean }) {
  return useQuery<ApiResponse<NotificationTemplateItem[]>, Error>({
    queryKey: ADMIN_NOTIFICATION_QUERY_KEYS.templates(params),
    queryFn: () => notificationService.getTemplates(params),
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useNotificationTemplate(id: string, options?: { enabled?: boolean }) {
  return useQuery<NotificationTemplateItem, Error>({
    queryKey: ADMIN_NOTIFICATION_QUERY_KEYS.template(id),
    queryFn: () => notificationService.getTemplate(id),
    staleTime: 60 * 1000,
    enabled: !!id && (options?.enabled ?? true),
  });
}

export function useCreateTemplateMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTemplatePayload) => notificationService.createTemplate(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "notification-templates"] });
    },
  });
}

export function useUpdateTemplateMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTemplatePayload }) =>
      notificationService.updateTemplate(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "notification-templates"] });
    },
  });
}

export function useDeleteTemplateMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationService.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "notification-templates"] });
    },
  });
}

export function useBroadcastNotificationMutation() {
  return useMutation({
    mutationFn: (payload: BroadcastNotificationPayload) => notificationService.broadcastNotification(payload),
  });
}
