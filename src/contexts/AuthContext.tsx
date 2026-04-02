import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  email: string;
  name: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  // Load user on refresh
  useEffect(() => {
    const stored = localStorage.getItem('sf_user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  // ✅ REGISTER
  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    const userData: User = { name, email, password };

    localStorage.setItem('sf_user', JSON.stringify(userData));
    setUser(userData);

    return true;
  };

  // ✅ LOGIN (FIXED)
  const login = async (email: string, password: string) => {
    const stored = localStorage.getItem('sf_user');

    if (!stored) return false;

    const userData: User = JSON.parse(stored);

    if (
      userData.email.trim() === email.trim() &&
      userData.password === password
    ) {
      setUser(userData);
      return true;
    }

    return false;
  };

  // ✅ LOGOUT
  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};