import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';

export const AuthContext = createContext({
  user: null,
  token: null,
  isAuthenticated: false,
  login: async () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // hydrate from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('auth_user');
    if (storedToken) setToken(storedToken);
    if (storedUser) {
      try { setUser(JSON.parse(storedUser)); } catch { setUser(null); }
    }
  }, []);

  const login = useCallback((nextUser, nextToken) => {
    setUser(nextUser || null);
    setToken(nextToken || null);
    if (nextToken) localStorage.setItem('access_token', nextToken); else localStorage.removeItem('access_token');
    if (nextUser) localStorage.setItem('auth_user', JSON.stringify(nextUser)); else localStorage.removeItem('auth_user');
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('auth_user');
  }, []);

  const value = useMemo(() => ({
    user,
    token,
    isAuthenticated: !!token,
    login,
    logout,
  }), [user, token, login, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};


