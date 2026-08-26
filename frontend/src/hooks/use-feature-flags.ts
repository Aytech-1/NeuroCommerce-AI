import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { featureFlagService } from "@/services/feature-flag-service";

export const FEATURE_FLAGS_QUERY_KEYS = {
  all: ["admin", "feature-flags"] as const,
};

export function useFeatureFlags() {
  return useQuery({
    queryKey: FEATURE_FLAGS_QUERY_KEYS.all,
    queryFn: () => featureFlagService.getFeatureFlags(),
    staleTime: 30 * 1000,
  });
}

export function useToggleFeatureFlag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      name,
      isEnabled,
      rollout,
    }: {
      name: string;
      isEnabled?: boolean;
      rollout?: number;
    }) => featureFlagService.toggleFeatureFlag(name, { is_enabled: isEnabled, rollout_percentage: rollout }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FEATURE_FLAGS_QUERY_KEYS.all });
    },
  });
}
