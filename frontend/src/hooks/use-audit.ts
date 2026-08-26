import { useQuery } from "@tanstack/react-query";
import { auditService, AuditQueryParams } from "@/services/audit-service";

export const AUDIT_QUERY_KEYS = {
  auditLogs: (params: AuditQueryParams) => ["admin", "audit-logs", params] as const,
  auditLog: (id: string) => ["admin", "audit-logs", id] as const,
  activityLogs: (params: { page?: number; per_page?: number; action?: string }) =>
    ["admin", "activity-logs", params] as const,
  userActivityLogs: (userId: string, params: { page?: number; per_page?: number }) =>
    ["admin", "activity-logs", "user", userId, params] as const,
};

export function useAuditLogs(params: AuditQueryParams = {}) {
  return useQuery({
    queryKey: AUDIT_QUERY_KEYS.auditLogs(params),
    queryFn: () => auditService.getAuditLogs(params),
    staleTime: 30 * 1000,
  });
}

export function useAuditLog(id: string) {
  return useQuery({
    queryKey: AUDIT_QUERY_KEYS.auditLog(id),
    queryFn: () => auditService.getAuditLog(id),
    enabled: !!id,
    staleTime: 60 * 1000,
  });
}

export function useActivityLogs(params: { page?: number; per_page?: number; action?: string } = {}) {
  return useQuery({
    queryKey: AUDIT_QUERY_KEYS.activityLogs(params),
    queryFn: () => auditService.getActivityLogs(params),
    staleTime: 30 * 1000,
  });
}

export function useUserActivityLogs(userId: string, params: { page?: number; per_page?: number } = {}) {
  return useQuery({
    queryKey: AUDIT_QUERY_KEYS.userActivityLogs(userId, params),
    queryFn: () => auditService.getUserActivityLogs(userId, params),
    enabled: !!userId,
    staleTime: 30 * 1000,
  });
}
