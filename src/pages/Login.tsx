import React, { useState, useEffect } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookOpen, Eye, EyeOff, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="min-h-screen bg-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900/20 to-purple-900/20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-cyan-500/5 to-purple-500/5 rounded-full blur-3xl animate-spin-slow"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          ></div>
        ))}
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 animate-fade-in">
          {/* Logo Section */}
          <div className="text-center">
            <Link to="/" className="inline-flex items-center justify-center space-x-3 mb-8 group">
              <div className="relative">
                <BookOpen className="w-12 h-12 text-cyan-400 group-hover:text-cyan-300 transition-colors duration-300" />
                <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-xl group-hover:bg-cyan-300/30 transition-all duration-300"></div>
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                EduFlow
              </span>
            </Link>
            <div className="space-y-2">
              <h2 className="text-4xl font-bold text-white">Welcome Back</h2>
              <p className="text-cyan-200/80 text-lg">Sign in to continue your learning journey</p>
            </div>
          </div>

          {/* Login Form */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6" autoComplete="on">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-white/90 text-sm font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="Enter your email"
                    className="mt-2 bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-cyan-400 focus:ring-cyan-400/20 rounded-xl h-12 transition-all duration-300"
                    autoComplete="email"
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="text-white/90 text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative mt-2">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={handleChange}
                      required
                      placeholder="Enter your password"
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-cyan-400 focus:ring-cyan-400/20 rounded-xl h-12 pr-12 transition-all duration-300"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-cyan-400 transition-colors duration-200"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Link
                  to="/forgot-password"
                  className="text-sm text-cyan-400 hover:text-cyan-300 font-medium transition-colors duration-200"
                >
                  Forgot Password?
                </Link>
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Signing In...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Zap className="w-5 h-5" />
                    <span>Sign In</span>
                  </div>
                )}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white/5 text-white/70 rounded-full">Or continue with</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  window.location.href = `${SERVER_URL}/api/auth/google`;
                }}
                className="w-full h-12 bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30 rounded-xl transition-all duration-300 transform hover:scale-[1.02]"
              >
                <img
                  src="https://developers.google.com/identity/images/g-logo.png"
                  alt="Google"
                  className="w-5 h-5 mr-3"
                />
                Continue with Google
              </Button>

              <div className="text-center pt-4">
                <span className="text-white/70">Don't have an account? </span>
                <Link 
                  to="/signup" 
                  className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors duration-200"
                >
                  Sign up as a student
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;