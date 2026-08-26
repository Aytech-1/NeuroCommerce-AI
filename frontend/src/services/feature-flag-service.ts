import { apiClient } from "@/lib/api/client";
import { ApiResponse } from "@/types/api";

export interface FeatureFlagItem {
  id?: string;
  name: string;
  description?: string | null;
  is_enabled: boolean;
  rollout_percentage: number;
  created_at?: string;
  updated_at?: string;
}

export const featureFlagService = {
  async getFeatureFlags(): Promise<FeatureFlagItem[]> {
    const response = await apiClient.get<ApiResponse<FeatureFlagItem[]>>("/admin/feature-flags");
    return response.data.data;
  },

  async toggleFeatureFlag(
    name: string,
    data: { is_enabled?: boolean; rollout_percentage?: number }
  ): Promise<FeatureFlagItem> {
    const response = await apiClient.patch<ApiResponse<FeatureFlagItem>>(
      `/admin/feature-flags/${encodeURIComponent(name)}`,
      data
    );
    return response.data.data;
  },
};
