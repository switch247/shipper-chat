'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { User } from './types';
import { CURRENT_USER } from './mocks/data';

interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    // Mocked login - simulate 500ms delay
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        // Mock: accept any email/password combination
        setIsAuthenticated(true);
        setCurrentUser({
          ...CURRENT_USER,
          email,
        });
        resolve();
      }, 500);
    });
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    // Mocked signup - simulate 500ms delay
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setIsAuthenticated(true);
        setCurrentUser({
          ...CURRENT_USER,
          name,
          email,
        });
        resolve();
      }, 500);
    });
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setCurrentUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        currentUser,
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
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
