import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<any>;
  quickDemoLogin: (role: UserRole) => Promise<void>;
  register: (data: any) => Promise<any>;
  verifyOtp: (email: string, code: string) => Promise<any>;
  resendOtp: (email: string) => Promise<any>;
  updateProfile: (data: any) => Promise<any>;
  changePassword: (current: string, newPass: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('rymec_auth_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (token) {
      api.getMe()
        .then((res) => {
          setUser(res.user);
        })
        .catch(() => {
          logout();
        })
        .finally(() => {
          setIsLoading(false);
        });
  } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const data = await api.login(email, pass);
      if (data.token) {
        localStorage.setItem('rymec_auth_token', data.token);
        setToken(data.token);
        setUser(data.user);
      }
      return data;
    } finally {
      setIsLoading(false);
    }
  };

  const quickDemoLogin = async (role: UserRole) => {
    const roleEmailMap: Record<UserRole, string> = {
      student: 'student.rahul@rymec.edu.in',
      lecturer: 'lecturer.anita@rymec.edu.in',
      warden: 'warden.mallikarjun@rymec.edu.in',
      hod: 'hod.cse@rymec.edu.in',
      mentor: 'mentor.priya@rymec.edu.in',
      principal: 'principal@rymec.edu.in',
    };
    const email = roleEmailMap[role];
    await login(email, 'password123');
  };

  const register = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await api.register(data);
      // Notice: token is NOT saved here because the user must verify OTP first!
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (email: string, code: string) => {
    setIsLoading(true);
    try {
      const res = await api.verifyOtp(email, code);
      if (res.token) {
        localStorage.setItem('rymec_auth_token', res.token);
        setToken(res.token);
        setUser(res.user);
      }
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const resendOtp = async (email: string) => {
    return await api.resendOtp(email);
  };

  const updateProfile = async (data: any) => {
    const res = await api.updateProfile(data);
    if (res.user) {
      setUser(res.user);
    }
    return res;
  };

  const changePassword = async (current: string, newPass: string) => {
    await api.changePassword(current, newPass);
  };

  const logout = () => {
    localStorage.removeItem('rymec_auth_token');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const res = await api.getMe();
      setUser(res.user);
    } catch (e) {
      // ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        quickDemoLogin,
        register,
        verifyOtp,
        resendOtp,
        updateProfile,
        changePassword,
        logout,
        refreshUser,
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
