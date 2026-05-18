const TOKEN_KEY = 'vocalens_token';
const USER_KEY = 'vocalens_user';
const LAST_ACTIVITY_KEY = 'vocalens_last_activity';
const AUTH_CHANGED_EVENT = 'vocalens-auth-changed';
const DEFAULT_SESSION_TIMEOUT_MINUTES = 60 * 24;

const configuredTimeout = Number(import.meta.env.VITE_SESSION_TIMEOUT_MINUTES);
export const SESSION_TIMEOUT_MS =
  (Number.isFinite(configuredTimeout) && configuredTimeout > 0
    ? configuredTimeout
    : DEFAULT_SESSION_TIMEOUT_MINUTES) *
  60 *
  1000;

function safeStorage() {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function decodeJwtPayload(token) {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
    return JSON.parse(window.atob(padded));
  } catch {
    return null;
  }
}

export function isTokenExpired(token) {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return true;
  return payload.exp * 1000 <= Date.now();
}

export function isSessionTimedOut() {
  const storage = safeStorage();
  const lastActivity = Number(storage?.getItem(LAST_ACTIVITY_KEY));
  if (!lastActivity) return false;
  return Date.now() - lastActivity > SESSION_TIMEOUT_MS;
}

export function touchSession() {
  const storage = safeStorage();
  const token = storage?.getItem(TOKEN_KEY);
  if (!token) return;
  if (isTokenExpired(token) || isSessionTimedOut()) {
    clearAuthSession();
    return;
  }
  storage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
}

export function clearAuthSession({ notify = true } = {}) {
  const storage = safeStorage();
  storage?.removeItem(TOKEN_KEY);
  storage?.removeItem(USER_KEY);
  storage?.removeItem(LAST_ACTIVITY_KEY);

  // Remove credentials from the old localStorage implementation so stale
  // long-lived tokens cannot silently rehydrate a new browser session.
  try {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
  } catch {
    // Storage may be unavailable in restricted browsing modes.
  }

  if (notify) {
    window.dispatchEvent(new CustomEvent(AUTH_CHANGED_EVENT));
  }
}

export function saveAuthSession({ access_token: token, user }) {
  const storage = safeStorage();
  if (!storage || !token || !user || isTokenExpired(token)) {
    clearAuthSession();
    return null;
  }

  storage.setItem(TOKEN_KEY, token);
  storage.setItem(USER_KEY, JSON.stringify(user));
  storage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
  window.dispatchEvent(new CustomEvent(AUTH_CHANGED_EVENT));
  return { token, user };
}

export function getAuthSession() {
  const storage = safeStorage();
  const token = storage?.getItem(TOKEN_KEY);
  const rawUser = storage?.getItem(USER_KEY);

  if (!token || !rawUser || isTokenExpired(token) || isSessionTimedOut()) {
    clearAuthSession({ notify: false });
    return null;
  }

  try {
    return { token, user: JSON.parse(rawUser) };
  } catch {
    clearAuthSession({ notify: false });
    return null;
  }
}

export function getSessionToken() {
  const session = getAuthSession();
  return session?.token || null;
}

export function onAuthSessionChange(callback) {
  window.addEventListener(AUTH_CHANGED_EVENT, callback);
  return () => window.removeEventListener(AUTH_CHANGED_EVENT, callback);
}
