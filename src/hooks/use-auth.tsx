import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { loginAPI, signupAPI, logoutAPI, getMeAPI, refreshTokenAPI, type AuthUser } from "@/lib/api";

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount, check if we have a stored token and hydrate the user
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await getMeAPI();
        setUser(res.user);
      } catch {
        // Token might be expired — try refresh
        const refreshToken = localStorage.getItem("refresh_token");
        if (refreshToken) {
          try {
            const refreshed = await refreshTokenAPI(refreshToken);
            localStorage.setItem("auth_token", refreshed.token);
            localStorage.setItem("refresh_token", refreshed.refreshToken);
            const res = await getMeAPI();
            setUser(res.user);
          } catch {
            // Refresh also failed — clear tokens
            localStorage.removeItem("auth_token");
            localStorage.removeItem("refresh_token");
            setUser(null);
          }
        } else {
          localStorage.removeItem("auth_token");
          setUser(null);
        }
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await loginAPI(email, password);
    localStorage.setItem("auth_token", res.token);
    localStorage.setItem("refresh_token", res.refreshToken);
    setUser(res.user);
  }, []);

  const signup = useCallback(async (email: string, password: string, fullName?: string) => {
    const res = await signupAPI(email, password, fullName);
    if (res.token) {
      localStorage.setItem("auth_token", res.token);
      localStorage.setItem("refresh_token", res.refreshToken);
      setUser(res.user);
    }
    // If no token (email confirmation required), don't set user
  }, []);

  const logout = useCallback(async () => {
    await logoutAPI();
    localStorage.removeItem("auth_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

