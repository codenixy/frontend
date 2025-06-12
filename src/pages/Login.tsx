import React, { useState, useEffect } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login, user, setUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const success = await login(form.email, form.password);

    if (success) {
      toast({
        title: 'Welcome back!',
        description: 'You have been successfully logged in.',
      });
      // Redirect based on user role if needed
      const userRaw = localStorage.getItem('lms_user');
      if (userRaw) {
        const userObj = JSON.parse(userRaw);
        navigate(`/${userObj.role || 'student'}`);
      } else {
        navigate('/');
      }
    } else {
      toast({
        title: 'Login failed',
        description: 'Please check your credentials and try again.',
        variant: 'destructive',
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('token', token);
      // Optionally, fetch user profile from backend using the token
      fetch(`${SERVER_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      })
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            localStorage.setItem('lms_user', JSON.stringify(data.user));
            setUser(data.user);
            navigate(`/${data.user.role || 'student'}`);
          }
        });
    }
  }, [navigate, setUser]);

  if (user) {
    return <Navigate to={`/${user.role || 'student'}`} replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link to="/" className="flex items-center justify-center space-x-2 mb-6">
            <BookOpen className="w-10 h-10 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">EduFlow</span>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p className="mt-2 text-gray-600">Sign in to your account to continue learning</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6" autoComplete="on">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter your email"
                  className="mt-1"
                  autoComplete="email"
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter your password"
                  className="mt-1"
                  autoComplete="current-password"
                />
              </div>

              <div className="flex justify-end">
                <Link
                  to="/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                >
                  Forgot Password?
                </Link>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
                onClick={() => {
                  window.location.href = `${SERVER_URL}/api/auth/google`;
                }}
              >
                <img
                  src="https://developers.google.com/identity/images/g-logo.png"
                  alt="Google"
                  className="w-5 h-5"
                />
                Continue with Google
              </Button>

              <div className="text-center">
                <span className="text-gray-600">Don't have an account? </span>
                <Link to="/signup" className="text-blue-600 hover:text-blue-500 font-medium">
                  Sign up as a student
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;