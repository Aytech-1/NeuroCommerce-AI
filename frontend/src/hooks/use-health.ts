import { useQuery } from "@tanstack/react-query";
import { healthService } from "@/services/health-service";

export const HEALTH_QUERY_KEYS = {
  health: ["admin", "system", "health"] as const,
  adminHealth: ["admin", "system", "health-detailed"] as const,
  version: ["admin", "system", "version"] as const,
};

export function useSystemHealth() {
  return useQuery({
    queryKey: HEALTH_QUERY_KEYS.health,
    queryFn: () => healthService.getHealth(),
    staleTime: 30 * 1000,
  });
}

export function useSystemVersion() {
  return useQuery({
    queryKey: HEALTH_QUERY_KEYS.version,
    queryFn: () => healthService.getVersion(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAdminSystemHealth() {
  return useQuery({
    queryKey: HEALTH_QUERY_KEYS.adminHealth,
    queryFn: () => healthService.getAdminSystemHealth(),
    staleTime: 30 * 1000,
  });
}
