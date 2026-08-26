import { apiClient } from "@/lib/api/client";
import { ApiResponse } from "@/types/api";

export interface SettingItem {
  id?: string;
  group: string;
  key: string;
  value: unknown;
  type: "string" | "integer" | "boolean" | "json" | "encrypted";
  is_public: boolean;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
}

export const settingsService = {
  async getAllGrouped(): Promise<Record<string, SettingItem[]>> {
    const response = await apiClient.get<ApiResponse<Record<string, SettingItem[]>>>("/admin/settings");
    return response.data.data;
  },

  async getByGroup(group: string): Promise<SettingItem[]> {
    const response = await apiClient.get<ApiResponse<SettingItem[]>>(`/admin/settings/${group}`);
    return response.data.data;
  },

  async bulkUpdate(settings: SettingItem[]): Promise<SettingItem[]> {
    const response = await apiClient.put<ApiResponse<SettingItem[]>>("/admin/settings", {
      settings,
    });
    return response.data.data;
  },

  async getPublicSettings(): Promise<Record<string, unknown>> {
    const response = await apiClient.get<ApiResponse<Record<string, unknown>>>("/settings");
    return response.data.data;
  },
};
