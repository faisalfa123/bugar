import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface UserAccountInfo {
  id: string;
  username: string;
  displayName: string;
  token: string;
}

interface AuthContextType {
  account: UserAccountInfo | null;
  isLoading: boolean;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  login: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (
    username: string,
    password: string,
    displayName: string,
    profileData?: { age?: number; gender?: string; height_cm?: number; weight_kg?: number; goal?: string }
  ) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<UserAccountInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  // Check auto-login token on app launch
  const checkSession = useCallback(async () => {
    const token = localStorage.getItem('bugar_auth_token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user_id) {
          setAccount({
            id: data.user_id,
            username: data.username || 'user',
            displayName: data.display_name || data.username || 'Pengguna Bugar',
            token,
          });
        } else {
          localStorage.removeItem('bugar_auth_token');
          setAccount(null);
        }
      } else {
        localStorage.removeItem('bugar_auth_token');
        setAccount(null);
      }
    } catch {
      // Offline fallback: keep token in localStorage
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const login = async (username: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.success && data.token) {
        localStorage.setItem('bugar_auth_token', data.token);
        setAccount({
          id: data.user_id,
          username: data.username,
          displayName: data.display_name,
          token: data.token,
        });
        setShowAuthModal(false);
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Login gagal' };
    } catch {
      return { success: false, message: 'Tidak dapat terhubung ke server bugar' };
    }
  };

  const register = async (
    username: string,
    password: string,
    displayName: string,
    profileData?: { age?: number; gender?: string; height_cm?: number; weight_kg?: number; goal?: string }
  ) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          password,
          display_name: displayName,
          ...profileData,
        }),
      });
      const data = await res.json();
      if (data.success && data.token) {
        localStorage.setItem('bugar_auth_token', data.token);
        setAccount({
          id: data.user_id,
          username: data.username,
          displayName: data.display_name,
          token: data.token,
        });
        setShowAuthModal(false);
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Pendaftaran gagal' };
    } catch {
      return { success: false, message: 'Tidak dapat terhubung ke server bugar' };
    }
  };

  const logout = async () => {
    const token = localStorage.getItem('bugar_auth_token');
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        // ignore network error
      }
    }
    localStorage.removeItem('bugar_auth_token');
    setAccount(null);
  };

  return (
    <AuthContext.Provider
      value={{
        account,
        isLoading,
        showAuthModal,
        setShowAuthModal,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
