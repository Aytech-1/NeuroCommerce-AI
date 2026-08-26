import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsService, SettingItem } from "@/services/settings-service";

export const SETTINGS_QUERY_KEYS = {
  all: ["admin", "settings"] as const,
  group: (group: string) => ["admin", "settings", group] as const,
  public: ["public", "settings"] as const,
};

export function useGroupedSettings() {
  return useQuery({
    queryKey: SETTINGS_QUERY_KEYS.all,
    queryFn: () => settingsService.getAllGrouped(),
    staleTime: 60 * 1000,
  });
}

export function useSettingsByGroup(group: string) {
  return useQuery({
    queryKey: SETTINGS_QUERY_KEYS.group(group),
    queryFn: () => settingsService.getByGroup(group),
    enabled: !!group,
    staleTime: 60 * 1000,
  });
}

export function useBulkUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (settings: SettingItem[]) => settingsService.bulkUpdate(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEYS.all });
    },
  });
}
