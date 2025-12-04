import api from './api';
import { API_ENDPOINTS } from '@/config/api';
import { LoginCredentials, LoginResponse, UserInfo } from '@/types';

// Session conflict response type
export interface SessionConflictResponse {
  session_conflict: boolean;
  message: string;
  existing_session_created_at: string | null;
  detail: string;
}

// Session validation response type
export interface SessionValidationResponse {
  valid: boolean;
  reason?: string;
  message?: string;
}

export const authService = {
  // Login - returns LoginResponse or SessionConflictResponse
  async login(credentials: LoginCredentials & { force_login?: boolean }): Promise<LoginResponse | SessionConflictResponse> {
    try {
      const response = await api.post<LoginResponse>(API_ENDPOINTS.login, {
        username: credentials.username,
        password: credentials.password,
        force_login: credentials.force_login || false
      });
      
      // Store token and user info
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      return response.data;
    } catch (error: any) {
      // Check if it's a session conflict (409)
      if (error.response?.status === 409 && error.response?.data?.session_conflict) {
        return error.response.data as SessionConflictResponse;
      }
      throw error;
    }
  },

  // Force login - override existing session
  async forceLogin(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>(API_ENDPOINTS.login, {
      username: credentials.username,
      password: credentials.password,
      force_login: true
    });
    
    // Store token and user info
    localStorage.setItem('access_token', response.data.access_token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    
    return response.data;
  },

  // Logout
  async logout(): Promise<void> {
    try {
      await api.post(API_ENDPOINTS.logout);
    } finally {
      // Clear local storage regardless of API response
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
    }
  },

  // Get current user
  async getCurrentUser(): Promise<UserInfo> {
    const response = await api.get<UserInfo>(API_ENDPOINTS.me);
    localStorage.setItem('user', JSON.stringify(response.data));
    return response.data;
  },

  // Validate current session
  async validateSession(): Promise<SessionValidationResponse> {
    try {
      const response = await api.get<SessionValidationResponse>('/auth/validate-session');
      return response.data;
    } catch (error) {
      return { valid: false, reason: 'Network error' };
    }
  },

  // Get stored user info
  getStoredUser(): UserInfo | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Get stored token
  getToken(): string | null {
    return localStorage.getItem('access_token');
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  // Check if user has specific role
  hasRole(role: string): boolean {
    const user = this.getStoredUser();
    return user?.roles.includes(role) || false;
  },

  // Check if user is admin
  isAdmin(): boolean {
    return this.hasRole('DMS_Admin');
  },

  // Clear session (for forced logout)
  clearSession(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  },
};

// Helper to check if response is a session conflict
export function isSessionConflict(response: LoginResponse | SessionConflictResponse): response is SessionConflictResponse {
  return 'session_conflict' in response && response.session_conflict === true;
}
