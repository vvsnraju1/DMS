import api from './api';
import { API_ENDPOINTS } from '@/config/api';
import {
  User,
  UserCreate,
  UserUpdate,
  UserListResponse,
  UserFilters,
  PasswordReset,
} from '@/types';

export const userService = {
  // Get all users with filters
  async getUsers(filters?: UserFilters): Promise<UserListResponse> {
    const response = await api.get<UserListResponse>(API_ENDPOINTS.users, {
      params: filters,
    });
    return response.data;
  },

  // Get user by ID
  async getUserById(id: number): Promise<User> {
    const response = await api.get<User>(API_ENDPOINTS.userById(id));
    return response.data;
  },

  // Create new user
  async createUser(userData: UserCreate): Promise<User> {
    const response = await api.post<User>(API_ENDPOINTS.users, userData);
    return response.data;
  },

  // Update user
  async updateUser(id: number, userData: UserUpdate): Promise<User> {
    const response = await api.put<User>(API_ENDPOINTS.userById(id), userData);
    return response.data;
  },

  // Activate user
  async activateUser(id: number): Promise<User> {
    const response = await api.patch<User>(API_ENDPOINTS.activateUser(id));
    return response.data;
  },

  // Deactivate user
  async deactivateUser(id: number): Promise<User> {
    const response = await api.patch<User>(API_ENDPOINTS.deactivateUser(id));
    return response.data;
  },

  // Reset password
  async resetPassword(id: number, data: PasswordReset): Promise<{ message: string }> {
    const response = await api.post(API_ENDPOINTS.resetPassword(id), data);
    return response.data;
  },

  // Delete user
  async deleteUser(id: number): Promise<void> {
    await api.delete(API_ENDPOINTS.userById(id));
  },
};


