import { apiClient } from "@/lib/api/client";
import { ApiResponse, User } from "@/types/api";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
}

export interface TokenPayload {
  access_token: string;
  token_type?: string;
  expires_at?: string;
}

export interface RawAuthResponseData {
  user: Record<string, any>;
  token: string | TokenPayload;
  permissions?: string[];
}

export interface AuthResponseData {
  user: User;
  token: string;
  permissions?: string[];
}

function extractTokenString(token: string | TokenPayload | undefined | null): string {
  if (!token) return "";
  if (typeof token === "string") return token;
  if (typeof token === "object" && typeof token.access_token === "string") {
    return token.access_token;
  }
  return "";
}

function normalizeUser(rawUser: Record<string, any>): User {
  const role =
    rawUser.role ||
    rawUser.user_type ||
    (Array.isArray(rawUser.roles) && rawUser.roles.length > 0 ? rawUser.roles[0] : "customer");

  const roles = Array.isArray(rawUser.roles)
    ? rawUser.roles
    : role
    ? [role]
    : [];

  return {
    id: rawUser.id || "",
    first_name: rawUser.first_name || "",
    last_name: rawUser.last_name || "",
    full_name: rawUser.full_name || `${rawUser.first_name || ""} ${rawUser.last_name || ""}`.trim(),
    email: rawUser.email || "",
    phone: rawUser.phone || null,
    user_type: rawUser.user_type || role,
    role,
    roles,
    permissions: Array.isArray(rawUser.permissions) ? rawUser.permissions : [],
    is_active: rawUser.is_active !== undefined ? Boolean(rawUser.is_active) : true,
    email_verified_at: rawUser.email_verified_at || null,
    created_at: rawUser.created_at || new Date().toISOString(),
    updated_at: rawUser.updated_at || undefined,
  };
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponseData> {
    const response = await apiClient.post<ApiResponse<RawAuthResponseData>>("/auth/login", credentials);
    const data = response.data.data;
    const token = extractTokenString(data.token);
    const user = normalizeUser(data.user);

    if (Array.isArray(data.permissions) && data.permissions.length > 0) {
      user.permissions = data.permissions;
    }

    return {
      user,
      token,
      permissions: data.permissions || user.permissions,
    };
  },

  async register(data: RegisterData): Promise<AuthResponseData> {
    const response = await apiClient.post<ApiResponse<RawAuthResponseData>>("/auth/register", data);
    const resData = response.data.data;
    const token = extractTokenString(resData.token);
    const user = normalizeUser(resData.user);

    return {
      user,
      token,
      permissions: resData.permissions || user.permissions,
    };
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post<ApiResponse<null>>("/auth/logout");
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_token");
      }
    }
  },

  async getMe(): Promise<User> {
    const response = await apiClient.get<ApiResponse<Record<string, any>>>("/auth/me");
    return normalizeUser(response.data.data);
  },

  async forgotPassword(email: string): Promise<string> {
    const response = await apiClient.post<ApiResponse<null>>("/auth/forgot-password", { email });
    return response.data.message;
  },
};
