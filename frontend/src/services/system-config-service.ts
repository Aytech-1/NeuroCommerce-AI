import { apiClient } from "@/lib/api/client";
import { ApiResponse } from "@/types/api";

export interface SystemConfigItem {
  id?: string;
  namespace: string;
  key: string;
  config_value: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export const systemConfigService = {
  async getSystemConfigs(): Promise<Record<string, SystemConfigItem[]>> {
    const response = await apiClient.get<ApiResponse<Record<string, SystemConfigItem[]>>>("/admin/system-config");
    return response.data.data;
  },

  async updateSystemConfig(
    namespace: string,
    configs: { key: string; config_value: Record<string, unknown> }[]
  ): Promise<SystemConfigItem[]> {
    const response = await apiClient.put<ApiResponse<SystemConfigItem[]>>(
      `/admin/system-config/${encodeURIComponent(namespace)}`,
      { configs }
    );
    return response.data.data;
  },
};
