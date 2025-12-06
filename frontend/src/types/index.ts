// User types
export interface Role {
  id: number;
  name: string;
  description: string | null;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  department: string | null;
  phone: string | null;
  is_active: boolean;
  is_temp_password: boolean;
  created_at: string;
  updated_at: string;
  last_login: string | null;
  roles: Role[];
}

export interface UserCreate {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  department?: string;
  phone?: string;
  role_ids: number[];
  is_active: boolean;
}

export interface UserUpdate {
  email?: string;
  first_name?: string;
  last_name?: string;
  department?: string;
  phone?: string;
  role_ids?: number[];
  is_active?: boolean;
}

// Auth types
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface UserInfo {
  id: number;
  username: string;
  email: string;
  full_name: string;
  roles: string[];
  is_active: boolean;
  is_admin?: boolean; // Derived from roles for convenience
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: UserInfo;
  requires_password_change: boolean;
}

// Audit log types
export interface AuditLog {
  id: number;
  user_id: number | null;
  username: string;
  action: string;
  entity_type: string;
  entity_id: number | null;
  description: string;
  details: Record<string, any> | null;
  ip_address: string | null;
  user_agent: string | null;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

export interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  page_size: number;
}

export interface AuditLogListResponse {
  logs: AuditLog[];
  total: number;
  page: number;
  page_size: number;
}

// Password reset
export interface PasswordReset {
  new_password: string;
  force_change: boolean;
}

// Filter types
export interface UserFilters {
  page?: number;
  page_size?: number;
  role?: string;
  is_active?: boolean;
  search?: string;
}

export interface AuditLogFilters {
  page?: number;
  page_size?: number;
  action?: string;
  entity_type?: string;
  user_id?: number;
  username?: string;
  start_date?: string;
  end_date?: string;
}


