import React, { createContext, ReactNode, useEffect, useState } from "react";
import { signIn, signUp } from "../services/auth/authService";

import api from "../utils/api";
import * as localStorage from "../utils/localStorage";
import { getCurrentUser, Usuario } from "../services/auth/userService";

interface AuthContextProps {
  authState?: {
    token: string | null;
    authenticated: boolean | null;
    user: Usuario | null;
  };
  onRegister?: (
    nome: string,
    email: string,
    dataNascimento: Date,
    senha: string,
    confirmarSenha: string
  ) => Promise<any>;
  onLogin?: (email: string, senha: string) => Promise<any>;
  onLogout?: () => Promise<any>;
  loadUserData?: () => Promise<void>;
  isLoading?: boolean;
}

interface AuthenticateProps {
  token: string | null;
  authenticated: boolean | null;
  user: Usuario | null;
}

type AuthProviderProps = {
  children: ReactNode;
};

const TOKEN_KEY = "access-token";

export const AuthContext = createContext<AuthContextProps>({});

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [authState, setAuthState] = useState<AuthenticateProps>({
    token: null,
    authenticated: null,
    user: null,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Função para carregar dados do usuário
  const loadUserData = async () => {
    try {
      setIsLoading(true);
      const userData = await getCurrentUser();
      setAuthState((prev) => ({
        ...prev,
        user: userData,
      }));
    } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error);
      // Se falhar ao carregar dados do usuário, pode ser que o token expirou
      await logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadToken = async () => {
      const token = await localStorage.getStorageItem(TOKEN_KEY);

      if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        setAuthState({
          token: token,
          authenticated: true,
          user: null,
        });

        await loadUserData();
      }
    };

    loadToken();
  }, []);

  const register = async (
    nome: string,
    email: string,
    dataNascimento: Date,
    senha: string,
    confirmarSenha: string
  ) => {
    try {
      await signUp({ nome, email, dataNascimento, senha, confirmarSenha });
    } catch (error) {
      console.error("Erro ao registrar", error);
      throw error;
    }
  };

  const login = async (email: string, senha: string) => {
    try {
      const result = await signIn({ email, senha });

      api.defaults.headers.common["Authorization"] = `Bearer ${result}`;

      await localStorage.setStorageItem(TOKEN_KEY, result);

      setAuthState({
        authenticated: true,
        token: result,
        user: null,
      });

      // Carrega os dados do usuário após o login
      await loadUserData();

      return result;
    } catch (error) {
      console.error("Erro ao fazer login", error);
      throw error;
    }
  };

  const logout = async () => {
    localStorage.removeStorageItem(TOKEN_KEY);
    api.defaults.headers.common["Authorization"] = "";
    setAuthState({
      authenticated: null,
      token: null,
      user: null,
    });
  };

  const value = {
    onRegister: register,
    onLogin: login,
    onLogout: logout,
    authState,
    loadUserData,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
