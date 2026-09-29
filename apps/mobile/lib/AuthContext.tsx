import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  getStoredUser,
  saveAuthSession,
  clearAuthSession,
  getAccessToken,
  getRefreshToken,
  subscribeToAuthChanges,
} from "./secureStore";
import { api } from "./api";

export interface AuthContextType {
  user: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (accessToken: string, refreshToken: string, user?: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<any | null>;
  updateUser: (updatedUser: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
  refreshUser: async () => null,
  updateUser: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async (): Promise<any | null> => {
    try {
      const stored = await getStoredUser();
      if (stored) {
        setUser(stored);
      }

      const token = await getAccessToken();
      if (token) {
        // Attempt background fetch of fresh profile
        try {
          const res = await api.get<{ success: boolean; user: any }>("/auth/profile");
          if (res.data?.success && res.data.user) {
            const freshUser = res.data.user;
            setUser(freshUser);
            const refresh = await getRefreshToken();
            if (refresh) {
              await saveAuthSession(token, refresh, freshUser);
            }
            return freshUser;
          }
        } catch {
          // If background request fails (offline or non-critical), keep stored user
        }
      } else {
        setUser(null);
      }

      return stored;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    // Initial session load
    getStoredUser()
      .then((stored) => {
        if (isMounted) {
          setUser(stored);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setUser(null);
          setIsLoading(false);
        }
      });

    // Subscribe to any session updates across the application
    const unsubscribe = subscribeToAuthChanges((updatedUser) => {
      if (isMounted) {
        setUser(updatedUser);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const login = useCallback(
    async (accessToken: string, refreshToken: string, userData?: any) => {
      await saveAuthSession(accessToken, refreshToken, userData);
      const stored = await getStoredUser();
      setUser(stored || userData || null);
    },
    []
  );

  const logout = useCallback(async () => {
    await clearAuthSession();
    setUser(null);
  }, []);

  const updateUser = useCallback(async (updatedUser: any) => {
    setUser(updatedUser);
    const token = await getAccessToken();
    const refresh = await getRefreshToken();
    if (token && refresh) {
      await saveAuthSession(token, refresh, updatedUser);
    }
  }, []);

  const isAuthenticated = Boolean(user && (user.id || user.userId || user.email));

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        refreshUser,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
