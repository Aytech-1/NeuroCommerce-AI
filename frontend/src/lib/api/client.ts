import axios, { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { ApiError, ApiResponse } from "@/types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
  timeout: 30000,
});

// Request Interceptor: Attach Sanctum Bearer Token and Guest Session ID
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token");
      if (token && token !== "[object Object]" && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      const sessionId = localStorage.getItem("guest_session_id");
      if (sessionId && config.headers) {
        config.headers["X-Session-ID"] = sessionId;
      }
    }
    return config;
  },
  (error: unknown) => Promise.reject(error)
);

// Response Interceptor: Normalize Response Envelopes and Standardize Errors
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => response,
  (error: AxiosError<ApiResponse>) => {
    const apiError: ApiError = {
      status: error.response?.status || 500,
      message: error.response?.data?.message || error.message || "An unexpected error occurred.",
      code: error.response?.data?.code,
      errors: error.response?.data?.errors,
    };

    // Handle 401 Unauthenticated
    if (apiError.status === 401 && typeof window !== "undefined") {
      // Do not clear on public login requests
      if (!window.location.pathname.includes("/login")) {
        localStorage.removeItem("auth_token");
      }
    }

    return Promise.reject(apiError);
  }
);
