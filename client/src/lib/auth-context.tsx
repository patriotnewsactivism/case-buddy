import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "./queryClient";
import type { User } from "@shared/schema";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName?: string;
  lastName?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const queryClient = useQueryClient();

  // Get current user
  const { data: authData, isLoading: isLoadingUser, refetch: refetchUser } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
    enabled: isInitialized,
  });

  const user = authData?.user || null;
  const isAuthenticated = !!user;

  // Initialize auth check
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async ({ usernameOrEmail, password }: { usernameOrEmail: string; password: string }) => {
      return apiRequest("/api/auth/login", {
        method: "POST",
        data: { usernameOrEmail, password },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterData) => {
      return apiRequest("/api/auth/register", {
        method: "POST",
        data: userData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/auth/logout", {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.clear(); // Clear all cached data
    },
  });

  const login = async (usernameOrEmail: string, password: string) => {
    try {
      await loginMutation.mutateAsync({ usernameOrEmail, password });
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || "Login failed" 
      };
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      await registerMutation.mutateAsync(userData);
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || "Registration failed" 
      };
    }
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: !isInitialized || isLoadingUser || loginMutation.isPending || registerMutation.isPending,
        isAuthenticated,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}