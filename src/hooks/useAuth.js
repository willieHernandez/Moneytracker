import { useState, useCallback } from 'react';

const AUTH_KEY = 'expense_auth';
const SESSION_KEY = 'expense_session';

async function hashPassword(password) {
  const encoded = new TextEncoder().encode(password);
  const buffer = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function loadCredentials() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function hasActiveSession() {
  return sessionStorage.getItem(SESSION_KEY) === '1';
}

export function useAuth() {
  const credentials = loadCredentials();
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!credentials && hasActiveSession()
  );
  const [authError, setAuthError] = useState('');

  const hasAccount = !!loadCredentials();

  const login = useCallback(async (username, password) => {
    setAuthError('');
    const creds = loadCredentials();
    if (!creds) {
      setAuthError('No account found.');
      return;
    }
    const hash = await hashPassword(password);
    if (creds.username !== username || creds.passwordHash !== hash) {
      setAuthError('Incorrect username or password.');
      return;
    }
    sessionStorage.setItem(SESSION_KEY, '1');
    setIsAuthenticated(true);
  }, []);

  const createAccount = useCallback(async (username, password) => {
    setAuthError('');
    const trimmed = username.trim();
    if (!trimmed) {
      setAuthError('Username cannot be empty.');
      return;
    }
    if (password.length < 4) {
      setAuthError('Password must be at least 4 characters.');
      return;
    }
    const hash = await hashPassword(password);
    localStorage.setItem(AUTH_KEY, JSON.stringify({ username: trimmed, passwordHash: hash }));
    sessionStorage.setItem(SESSION_KEY, '1');
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    setIsAuthenticated(false);
    setAuthError('');
  }, []);

  const deleteAccount = useCallback(() => {
    // Wipe all app data
    const keys = [
      AUTH_KEY,
      SESSION_KEY,
      'expense_category_mappings',
      'expense_custom_categories',
      'expense_budgets',
      'expense_monthly_history',
    ];
    keys.forEach((k) => localStorage.removeItem(k));
    sessionStorage.removeItem(SESSION_KEY);
    setIsAuthenticated(false);
    setAuthError('');
  }, []);

  const getUsername = useCallback(() => {
    const creds = loadCredentials();
    return creds ? creds.username : '';
  }, []);

  return {
    isAuthenticated,
    hasAccount: !!loadCredentials(),
    authError,
    login,
    createAccount,
    logout,
    deleteAccount,
    getUsername,
  };
}
