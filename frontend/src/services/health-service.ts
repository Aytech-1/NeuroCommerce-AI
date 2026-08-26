import { apiClient } from "@/lib/api/client";
import { ApiResponse } from "@/types/api";

export interface SystemHealthData {
  status: string;
  version: string;
  timestamp: string;
}

export interface SystemVersionData {
  name: string;
  version: string;
  laravel: string;
  php: string;
}

export const healthService = {
  async getHealth(): Promise<SystemHealthData> {
    const response = await apiClient.get<ApiResponse<SystemHealthData>>("/health");
    return response.data.data;
  },

  async getVersion(): Promise<SystemVersionData> {
    const response = await apiClient.get<ApiResponse<SystemVersionData>>("/version");
    return response.data.data;
  },
};
