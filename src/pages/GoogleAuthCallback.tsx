import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

export const useGoogleAuthCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const { toast } = useToast();

  const fetchUserFromToken = async (token: string) => {
    try {
      const response = await fetch(`${SERVER_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      });
      const data = await response.json();
      if (response.ok && data.user) {
        localStorage.setItem('lms_user', JSON.stringify(data.user));
        // Optionally: setUser(data.user); // If you want to update context here
        return data.user;
      }
    } catch (error) {
      console.error('Failed to fetch user from token', error);
    }
    return null;
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('token', token);
      (async () => {
        const user = await fetchUserFromToken(token);
        if (user) {
          setUser(user);
          toast({
            title: 'Welcome!',
            description: 'Signed in with Google successfully.',
          });
          setTimeout(() => {
            navigate(`/${user.role}`);
          }, 100);
        } else {
          toast({
            title: 'Login failed',
            description: 'Could not fetch user info from Google login.',
            variant: 'destructive',
          });
          navigate('/login');
        }
      })();
    }
  }, [location.search, navigate, toast, setUser]);

  return <div>Logging you in with Google...</div>;
};

// export default GoogleAuthCallback;