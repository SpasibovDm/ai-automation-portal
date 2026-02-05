import React, { createContext, useContext, useMemo, useState } from "react";

import { login as loginRequest, register as registerRequest } from "../services/api";

const AuthContext = createContext(null);

const userEmailKey = "automation-user-email";

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("accessToken"));
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem(userEmailKey));

  const signIn = async (email, password) => {
    const data = await loginRequest(email, password);
    localStorage.setItem("accessToken", data.access_token);
    localStorage.setItem("refreshToken", data.refresh_token);
    localStorage.setItem(userEmailKey, email);
    setToken(data.access_token);
    setUserEmail(email);
    return data;
  };

  const registerAccount = async (payload) => {
    await registerRequest(payload);
  };

  const signOut = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem(userEmailKey);
    setToken(null);
    setUserEmail(null);
  };

  const value = useMemo(
    () => ({
      token,
      user: userEmail ? { email: userEmail } : null,
      signIn,
      signOut,
      registerAccount,
    }),
    [token, userEmail]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
