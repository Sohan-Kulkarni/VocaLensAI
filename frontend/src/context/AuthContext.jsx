import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { fetchMe, loginUser, registerUser } from '../api/auth';
import {
  clearAuthSession,
  getAuthSession,
  isSessionTimedOut,
  isTokenExpired,
  onAuthSessionChange,
  saveAuthSession,
  SESSION_TIMEOUT_MS,
  touchSession,
} from '../utils/authSession';

const AuthContext = createContext(null);

function getInitialAuthState() {
  const session = getAuthSession();
  return {
    token: session?.token || null,
    user: session?.user || null,
    loading: Boolean(session?.token),
  };
}

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(getInitialAuthState);
  const { token, user, loading } = authState;

  const syncFromSession = useCallback(() => {
    const session = getAuthSession();
    setAuthState((current) => ({
      token: session?.token || null,
      user: session?.user || null,
      loading: current.loading && Boolean(session?.token),
    }));
  }, []);

  const logout = useCallback(() => {
    clearAuthSession();
    setAuthState({ token: null, user: null, loading: false });
  }, []);

  useEffect(() => {
    let mounted = true;
    async function hydrate() {
      if (!token) {
        setAuthState((current) => ({ ...current, loading: false }));
        return;
      }
      if (isTokenExpired(token) || isSessionTimedOut()) {
        clearAuthSession();
        if (mounted) setAuthState({ token: null, user: null, loading: false });
        return;
      }
      try {
        const profile = await fetchMe();
        if (mounted) {
          // Validate the stored JWT with the backend on app load/refresh and keep
          // the tab-scoped user snapshot synchronized with server state.
          saveAuthSession({ access_token: token, user: profile });
          setAuthState({ token, user: profile, loading: false });
        }
      } catch {
        clearAuthSession();
        if (mounted) {
          setAuthState({ token: null, user: null, loading: false });
        }
      } finally {
        if (mounted) setAuthState((current) => ({ ...current, loading: false }));
      }
    }
    hydrate();
    return () => {
      mounted = false;
    };
  }, [token]);

  useEffect(() => onAuthSessionChange(syncFromSession), [syncFromSession]);

  useEffect(() => {
    if (!token) return undefined;

    const activityEvents = ['click', 'keydown', 'mousemove', 'scroll', 'touchstart'];
    activityEvents.forEach((eventName) => window.addEventListener(eventName, touchSession, { passive: true }));

    const sessionCheck = window.setInterval(() => {
      if (isTokenExpired(token) || isSessionTimedOut()) {
        logout();
      }
    }, Math.min(60_000, SESSION_TIMEOUT_MS));

    return () => {
      activityEvents.forEach((eventName) => window.removeEventListener(eventName, touchSession));
      window.clearInterval(sessionCheck);
    };
  }, [logout, token]);

  async function login(payload) {
    const data = await loginUser(payload);
    saveAuthSession(data);
    setAuthState({ token: data.access_token, user: data.user, loading: false });
    return data.user;
  }

  async function register(payload) {
    const data = await registerUser(payload);
    saveAuthSession(data);
    setAuthState({ token: data.access_token, user: data.user, loading: false });
    return data.user;
  }

  const value = useMemo(
    () => ({ token, user, loading, isAuthenticated: Boolean(token && user), login, register, logout }),
    [token, user, loading, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return value;
}
