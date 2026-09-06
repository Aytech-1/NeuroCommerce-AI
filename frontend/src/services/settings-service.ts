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
    const response = await apiClient.get<ApiResponse<Record<string, unknown>>>("/admin/settings");
    const raw = response.data?.data;
    if (!raw) return {};

    const normalized: Record<string, SettingItem[]> = {};

    for (const [groupKey, groupVal] of Object.entries(raw)) {
      if (Array.isArray(groupVal)) {
        normalized[groupKey] = groupVal as SettingItem[];
      } else if (typeof groupVal === "object" && groupVal !== null) {
        normalized[groupKey] = Object.entries(groupVal as Record<string, Record<string, unknown>>).map(([k, item]) => ({
          id: typeof item?.id === "string" ? item.id : undefined,
          group: groupKey,
          key: k,
          value: item?.value,
          type: (item?.type as SettingItem["type"]) || "string",
          is_public: Boolean(item?.is_public),
          description: typeof item?.description === "string" ? item.description : null,
        }));
      }
    }

    return normalized;
  },

  async getByGroup(group: string): Promise<SettingItem[]> {
    const response = await apiClient.get<ApiResponse<unknown>>(`/admin/settings/${group}`);
    const raw = response.data?.data;
    if (!raw) return [];

    if (Array.isArray(raw)) {
      return raw as SettingItem[];
    }

    if (typeof raw === "object" && raw !== null) {
      return Object.entries(raw as Record<string, Record<string, unknown>>).map(([k, item]) => ({
        id: typeof item?.id === "string" ? item.id : undefined,
        group,
        key: k,
        value: item?.value,
        type: (item?.type as SettingItem["type"]) || "string",
        is_public: Boolean(item?.is_public),
        description: typeof item?.description === "string" ? item.description : null,
      }));
    }

    return [];
  },

  async bulkUpdate(settings: SettingItem[]): Promise<Record<string, SettingItem[]>> {
    const response = await apiClient.put<ApiResponse<Record<string, unknown>>>("/admin/settings", {
      settings,
    });
    const raw = response.data?.data;
    if (!raw) return {};

    const normalized: Record<string, SettingItem[]> = {};

    for (const [groupKey, groupVal] of Object.entries(raw)) {
      if (Array.isArray(groupVal)) {
        normalized[groupKey] = groupVal as SettingItem[];
      } else if (typeof groupVal === "object" && groupVal !== null) {
        normalized[groupKey] = Object.entries(groupVal as Record<string, Record<string, unknown>>).map(([k, item]) => ({
          id: typeof item?.id === "string" ? item.id : undefined,
          group: groupKey,
          key: k,
          value: item?.value,
          type: (item?.type as SettingItem["type"]) || "string",
          is_public: Boolean(item?.is_public),
          description: typeof item?.description === "string" ? item.description : null,
        }));
      }
    }

    return normalized;
  },

  async getPublicSettings(): Promise<Record<string, unknown>> {
    const response = await apiClient.get<ApiResponse<Record<string, unknown>>>("/settings");
    return response.data?.data || {};
  },
};
