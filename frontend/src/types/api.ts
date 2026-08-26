export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  meta?: PaginationMeta;
  links?: PaginationLinks;
  errors?: Record<string, string[]>;
  code?: string;
}

export interface PaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page?: number;
  from?: number;
  to?: number;
}

export interface PaginationLinks {
  first?: string | null;
  last?: string | null;
  prev?: string | null;
  next?: string | null;
}

export interface ApiError {
  status: number;
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
}

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  full_name?: string;
  email: string;
  phone?: string | null;
  user_type?: string;
  role: string;
  roles?: string[];
  permissions?: string[];
  is_active: boolean;
  email_verified_at?: string | null;
  created_at: string;
  updated_at?: string;
}
