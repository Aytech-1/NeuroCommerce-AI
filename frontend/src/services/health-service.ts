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

export interface ApplicationHealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  name: string;
  version: string;
  environment: string;
  debug_mode: boolean;
  laravel_version: string;
  php_version: string;
  timezone: string;
  locale: string;
}

export interface DatabaseHealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  connection: string;
  database_name?: string;
  response_time_ms: number | null;
  error?: string;
}

export interface CacheHealthStatus {
  status: "healthy" | "degraded" | "unhealthy" | "not_configured";
  driver: string;
  response_time_ms: number | null;
  error?: string;
}

export interface QueueHealthStatus {
  status: "healthy" | "degraded" | "configured" | "unavailable" | "not_configured";
  driver: string;
  worker_status: string;
}

export interface StorageHealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  disk: string;
  writable: boolean;
  response_time_ms?: number | null;
  error?: string;
}

export interface ExternalServiceHealth {
  name: string;
  status: "healthy" | "degraded" | "unhealthy" | "not_configured";
  provider: string;
}

export interface SecurityWarning {
  type: string;
  severity: "info" | "warning" | "critical";
  message: string;
}

export interface AdminSystemHealthData {
  status: "healthy" | "degraded" | "unhealthy";
  checked_at: string;
  application: ApplicationHealthStatus;
  database: DatabaseHealthStatus;
  cache: CacheHealthStatus;
  queue: QueueHealthStatus;
  storage: StorageHealthStatus;
  external_services: ExternalServiceHealth[];
  security_warnings: SecurityWarning[];
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

  async getAdminSystemHealth(): Promise<AdminSystemHealthData> {
    const response = await apiClient.get<ApiResponse<AdminSystemHealthData>>("/admin/system-health");
    return response.data.data;
  },
};
