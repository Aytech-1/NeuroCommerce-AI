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
  user: Record<string, unknown>;
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

function normalizeUser(rawUser: Record<string, unknown>): User {
  const rawRole = typeof rawUser.role === "string" ? rawUser.role : undefined;
  const rawUserType = typeof rawUser.user_type === "string" ? rawUser.user_type : undefined;
  const rawRoles = Array.isArray(rawUser.roles) ? (rawUser.roles as string[]) : [];
  const role = rawRole || rawUserType || (rawRoles.length > 0 ? rawRoles[0] : "customer");
  const roles = rawRoles.length > 0 ? rawRoles : role ? [role] : [];
  const firstName = typeof rawUser.first_name === "string" ? rawUser.first_name : "";
  const lastName = typeof rawUser.last_name === "string" ? rawUser.last_name : "";
  const fullName = typeof rawUser.full_name === "string" ? rawUser.full_name : `${firstName} ${lastName}`.trim();
  const permissions = Array.isArray(rawUser.permissions) ? (rawUser.permissions as string[]) : [];

  return {
    id: typeof rawUser.id === "string" ? rawUser.id : "",
    first_name: firstName,
    last_name: lastName,
    full_name: fullName,
    email: typeof rawUser.email === "string" ? rawUser.email : "",
    phone: typeof rawUser.phone === "string" ? rawUser.phone : null,
    user_type: rawUserType || role,
    role,
    roles,
    permissions,
    is_active: rawUser.is_active !== undefined ? Boolean(rawUser.is_active) : true,
    email_verified_at: typeof rawUser.email_verified_at === "string" ? rawUser.email_verified_at : null,
    created_at: typeof rawUser.created_at === "string" ? rawUser.created_at : new Date().toISOString(),
    updated_at: typeof rawUser.updated_at === "string" ? rawUser.updated_at : undefined,
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
    const response = await apiClient.get<ApiResponse<Record<string, unknown>>>("/auth/me");
    return normalizeUser(response.data.data);
  },

  async forgotPassword(email: string): Promise<string> {
    const response = await apiClient.post<ApiResponse<null>>("/auth/forgot-password", { email });
    return response.data.message;
  },
};
