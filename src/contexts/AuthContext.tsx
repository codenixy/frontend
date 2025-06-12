import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

interface User {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  profileImage?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, otp: string) => Promise<boolean>;
  logout: () => void;
  handleGoogleCallback: () => Promise<void>;
  sendOtp: (email: string, mode?: 'signup' | 'forgot') => Promise<boolean>;
  verifyOtp: (email: string, otp: string) => Promise<boolean>;
  resetPassword: (email: string, otp: string, newPassword: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  setUser: () => {},
  login: async () => false,
  register: async () => false,
  logout: () => {},
  handleGoogleCallback: async () => {},
  sendOtp: async () => false,
  verifyOtp: async () => false,
  resetPassword: async () => false,
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Handle Google OAuth token in URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('token', token);
      fetchUserFromToken(token);
      // Optionally, remove token from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      const storedUser = localStorage.getItem('lms_user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          setUser(parsed);
        } catch (error) {
          console.error('Failed to parse stored user:', error);
        }
      }
      setIsLoading(false);
    }
    // eslint-disable-next-line
  }, []);

  // Login: send email and password as plain text to backend
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${SERVER_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }), // plain text
      });

      const data = await response.json();

      if (response.ok && data.user && data.token) {
        localStorage.setItem('lms_user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        setUser(data.user);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  // Register: send name, email, and password as plain text to backend
  const register = async (name: string, email: string, password: string, otp: string): Promise<boolean> => {
    try {
      const response = await fetch(`${SERVER_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, otp }), // include otp
      });

      const data = await response.json();

      if (response.ok && data.user && data.token) {
        localStorage.setItem('lms_user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        setUser(data.user);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Register error:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('lms_user');
    localStorage.removeItem('token');
    setUser(null);
  };

  const handleGoogleCallback = async (): Promise<void> => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
      localStorage.setItem('token', token);
      await fetchUserFromToken(token);
    } else {
      console.warn('No token found in Google callback URL');
    }
  };

  const fetchUserFromToken = async (token: string) => {
    try {
      const response = await fetch(`${SERVER_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok && data.user) {
        localStorage.setItem('lms_user', JSON.stringify(data.user));
        setUser(data.user);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch user from token', error);
      setIsLoading(false);
    }
  };

  // Send OTP: send email (and mode if provided) as plain text
  const sendOtp = async (email: string, mode?: 'signup' | 'forgot'): Promise<boolean> => {
    try {
      const body: any = { email };
      if (mode) body.mode = mode;
      const response = await fetch(`${SERVER_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      return response.ok;
    } catch (error) {
      console.error('Send OTP error:', error);
      return false;
    }
  };

  // Verify OTP: send email and otp as plain text
  const verifyOtp = async (email: string, otp: string): Promise<boolean> => {
    try {
      const response = await fetch(`${SERVER_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      return response.ok;
    } catch (error) {
      console.error('Verify OTP error:', error);
      return false;
    }
  };

  // Reset password: send email, otp, and newPassword as plain text
  const resetPassword = async (email: string, otp: string, newPassword: string): Promise<boolean> => {
    try {
      const response = await fetch(`${SERVER_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      return response.ok;
    } catch (error) {
      console.error('Reset password error:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        setUser,
        login,
        register,
        logout,
        handleGoogleCallback,
        sendOtp,
        verifyOtp,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
