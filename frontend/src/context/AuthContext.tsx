import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { UserInfo, LoginCredentials } from '@/types';
import { authService, isSessionConflict, SessionConflictResponse } from '@/services/auth.service';

interface AuthContextType {
  user: UserInfo | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; sessionConflict?: SessionConflictResponse }>;
  forceLogin: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  hasRole: (role: string) => boolean;
  sessionInvalidated: boolean;
  clearSessionInvalidated: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Session validation interval (check every 30 seconds)
const SESSION_CHECK_INTERVAL = 30000;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionInvalidated, setSessionInvalidated] = useState(false);
  const sessionCheckRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start session validation polling
  const startSessionValidation = useCallback(() => {
    if (sessionCheckRef.current) {
      clearInterval(sessionCheckRef.current);
    }

    sessionCheckRef.current = setInterval(async () => {
      if (authService.isAuthenticated()) {
        const result = await authService.validateSession();
        if (!result.valid) {
          console.log('Session invalidated:', result.reason);
          // Session was invalidated (user logged in elsewhere)
          setSessionInvalidated(true);
          // Clear local storage but don't redirect yet - let UI handle it
          authService.clearSession();
          setUser(null);
          if (sessionCheckRef.current) {
            clearInterval(sessionCheckRef.current);
          }
        }
      }
    }, SESSION_CHECK_INTERVAL);
  }, []);

  // Stop session validation polling
  const stopSessionValidation = useCallback(() => {
    if (sessionCheckRef.current) {
      clearInterval(sessionCheckRef.current);
      sessionCheckRef.current = null;
    }
  }, []);

  // Check session on tab focus (for faster invalidation detection)
  const checkSessionOnFocus = useCallback(async () => {
    if (authService.isAuthenticated() && !sessionInvalidated) {
      const result = await authService.validateSession();
      if (!result.valid) {
        console.log('Session invalidated on focus:', result.reason);
        setSessionInvalidated(true);
        authService.clearSession();
        setUser(null);
        stopSessionValidation();
      }
    }
  }, [sessionInvalidated, stopSessionValidation]);

  useEffect(() => {
    // Check if user is already logged in
    const initAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          // Validate the session first
          const sessionResult = await authService.validateSession();
          if (!sessionResult.valid) {
            // Session is invalid, clear everything
            authService.clearSession();
            setUser(null);
            return;
          }

          const storedUser = authService.getStoredUser();
          if (storedUser) {
            setUser(storedUser);
            startSessionValidation();
          } else {
            // Fetch user info if not in storage
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser);
            startSessionValidation();
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        authService.clearSession();
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Add focus listener for immediate session check when switching tabs
    const handleFocus = () => {
      checkSessionOnFocus();
    };
    window.addEventListener('focus', handleFocus);

    // Cleanup on unmount
    return () => {
      stopSessionValidation();
      window.removeEventListener('focus', handleFocus);
    };
  }, [startSessionValidation, stopSessionValidation, checkSessionOnFocus]);

  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; sessionConflict?: SessionConflictResponse }> => {
    const response = await authService.login(credentials);
    
    if (isSessionConflict(response)) {
      // Return session conflict info to the caller
      return { success: false, sessionConflict: response };
    }
    
    // Successful login
    setUser(response.user);
    setSessionInvalidated(false);
    startSessionValidation();
    return { success: true };
  };

  const forceLogin = async (credentials: LoginCredentials) => {
    const response = await authService.forceLogin(credentials);
    setUser(response.user);
    setSessionInvalidated(false);
    startSessionValidation();
  };

  const logout = async () => {
    stopSessionValidation();
    try {
      await authService.logout();
    } catch (error) {
      // Still clear local state even if API call fails
      authService.clearSession();
    }
    setUser(null);
    setSessionInvalidated(false);
  };

  const clearSessionInvalidated = () => {
    setSessionInvalidated(false);
  };

  const hasRole = (role: string): boolean => {
    return user?.roles.includes(role) || false;
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    forceLogin,
    logout,
    isAuthenticated: !!user,
    isAdmin: hasRole('DMS_Admin'),
    hasRole,
    sessionInvalidated,
    clearSessionInvalidated,
  };
 
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
