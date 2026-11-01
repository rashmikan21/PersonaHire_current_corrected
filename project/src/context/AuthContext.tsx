
import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  login: (email: string, name: string) => void;
  register: (name: string, email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_EMAIL_KEY = 'personahire_current_email';

function notifyAuthChanged() {
  window.dispatchEvent(new Event('personahire-auth-changed'));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const email = localStorage.getItem(CURRENT_EMAIL_KEY);
      const savedName = email
        ? localStorage.getItem(`personahire_name_${email.toLowerCase()}`)
        : null;

      if (!email) return null;

      return {
        id: email.trim().toLowerCase(),
        email,
        name: savedName || email.split('@')[0],
      };
    } catch {
      return null;
    }
  });

  const login = (email: string, name: string) => {
    const normalizedEmail = email.trim().toLowerCase();

    localStorage.setItem(CURRENT_EMAIL_KEY, normalizedEmail);
    localStorage.setItem(
      `personahire_name_${normalizedEmail}`,
      name.trim() || normalizedEmail.split('@')[0]
    );

    setUser({
      id: normalizedEmail,
      email: normalizedEmail,
      name: name.trim() || normalizedEmail.split('@')[0],
    });

    notifyAuthChanged();
  };

  const register = (name: string, email: string) => {
    login(email, name);
  };

  const logout = () => {
    localStorage.removeItem(CURRENT_EMAIL_KEY);
    setUser(null);
    notifyAuthChanged();
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return ctx;
}

