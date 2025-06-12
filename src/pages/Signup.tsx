import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookOpen, Eye, EyeOff, Zap, Mail, Shield, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useGoogleAuthCallback } from './GoogleAuthCallback';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [step, setStep] = useState<'email' | 'otp' | 'details'>('email');
  const [otp, setOtp] = useState('');
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [otpVerified, setOtpVerified] = useState(false);
  const { register, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  useGoogleAuthCallback();

  useEffect(() => {
    if (otpCooldown > 0) {
      const timer = setTimeout(() => setOtpCooldown(otpCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCooldown]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validateEmail = (email: string) => {
    return email.endsWith('@gmail.com');
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.email.endsWith('@gmail.com')) {
      toast({
        title: 'Invalid Email',
        description: 'Please use a Gmail address to sign up.',
        variant: 'destructive',
      });
      return;
    }
    if (otpCooldown > 0) return;
    setLoading(true);
    try {
      const response = await fetch(`${SERVER_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, mode: 'signup' }),
      });
      const data = await response.json();
      setLoading(false);
      if (response.ok) {
        setOtpSent(true);
        setStep('otp');
        setOtpCooldown(60);
        toast({ title: 'OTP Sent', description: 'Check your email for the OTP.' });
      } else if (data.message === 'User already exists') {
        toast({
          title: 'User Already Exists',
          description: 'This email is already registered. Please login instead.',
          variant: 'destructive',
        });
      } else {
        toast({ title: 'Failed to send OTP', description: data.message || 'Try again.', variant: 'destructive' });
      }
    } catch (err) {
      setLoading(false);
      toast({ title: 'Failed to send OTP', description: 'Try again.', variant: 'destructive' });
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${SERVER_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp }),
      });
      setLoading(false);
      if (response.ok) {
        setOtpVerified(true);
        setStep('details');
        toast({ title: 'OTP Verified', description: 'You can now create your account.' });
      } else {
        toast({ title: 'Invalid OTP', description: 'Please check your OTP and try again.', variant: 'destructive' });
      }
    } catch {
      setLoading(false);
      toast({ title: 'Error', description: 'Failed to verify OTP.', variant: 'destructive' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(formData.email)) {
      toast({
        title: 'Invalid Email',
        description: 'Please use a Gmail address to sign up.',
        variant: 'destructive',
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Password Mismatch',
        description: 'Passwords do not match.',
        variant: 'destructive',
      });
      return;
    }

    if (!otpVerified) {
      toast({
        title: 'OTP Not Verified',
        description: 'Please verify your OTP before creating an account.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const success = await register(formData.name, formData.email, formData.password, otp);
      if (success) {
        toast({
          title: 'Account Created',
          description: 'Welcome to EduFlow!',
        });
        navigate('/student');
      } else {
        toast({
          title: 'Signup Failed',
          description: 'Email may already be in use or OTP not verified.',
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Unexpected error. Try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 'email':
        return (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-white/90 text-sm font-medium">
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your Gmail address"
                className="mt-2 bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-cyan-400 focus:ring-cyan-400/20 rounded-xl h-12 transition-all duration-300"
              />
              <p className="text-cyan-200/60 text-sm mt-1">Must be a Gmail address</p>
            </div>

            <Button 
              type="submit" 
              disabled={loading || otpCooldown > 0}
              className="w-full h-12 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-cyan-500/25 disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Sending OTP...</span>
                </div>
              ) : otpCooldown > 0 ? (
                `Resend OTP in ${otpCooldown}s`
              ) : (
                <div className="flex items-center space-x-2">
                  <Mail className="w-5 h-5" />
                  <span>Send OTP</span>
                </div>
              )}
            </Button>
          </form>
        );

      case 'otp':
        return (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-cyan-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Check Your Email</h3>
              <p className="text-cyan-200/80">We've sent a verification code to {formData.email}</p>
            </div>

            <div>
              <Label htmlFor="otp" className="text-white/90 text-sm font-medium">
                Verification Code
              </Label>
              <Input
                id="otp"
                name="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                placeholder="Enter the 6-digit code"
                className="mt-2 bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-cyan-400 focus:ring-cyan-400/20 rounded-xl h-12 text-center text-lg tracking-widest transition-all duration-300"
                maxLength={6}
              />
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-cyan-500/25"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Verifying...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>Verify Code</span>
                </div>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleSendOtp}
              disabled={loading || otpCooldown > 0}
              className="w-full h-12 bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30 rounded-xl transition-all duration-300"
            >
              {otpCooldown > 0 ? `Resend in ${otpCooldown}s` : 'Resend Code'}
            </Button>
          </form>
        );

      case 'details':
        return (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Email Verified!</h3>
              <p className="text-cyan-200/80">Now let's create your account</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-white/90 text-sm font-medium">
                  Full Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your full name"
                  className="mt-2 bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-cyan-400 focus:ring-cyan-400/20 rounded-xl h-12 transition-all duration-300"
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
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Create a strong password"
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-cyan-400 focus:ring-cyan-400/20 rounded-xl h-12 pr-12 transition-all duration-300"
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

              <div>
                <Label htmlFor="confirmPassword" className="text-white/90 text-sm font-medium">
                  Confirm Password
                </Label>
                <div className="relative mt-2">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder="Confirm your password"
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-cyan-400 focus:ring-cyan-400/20 rounded-xl h-12 pr-12 transition-all duration-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-cyan-400 transition-colors duration-200"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-cyan-500/25"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Creating Account...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Zap className="w-5 h-5" />
                  <span>Create Account</span>
                </div>
              )}
            </Button>
          </form>
        );

      default:
        return null;
    }
  };

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
              <h2 className="text-4xl font-bold text-white">Join EduFlow</h2>
              <p className="text-cyan-200/80 text-lg">Create your student account and start learning today</p>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="flex justify-center space-x-2 mb-8">
            {['email', 'otp', 'details'].map((stepName, index) => (
              <div
                key={stepName}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  step === stepName
                    ? 'bg-cyan-400 scale-125'
                    : ['email', 'otp', 'details'].indexOf(step) > index
                    ? 'bg-green-400'
                    : 'bg-white/20'
                }`}
              ></div>
            ))}
          </div>

          {/* Form Container */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl">
            {renderStepContent()}

            {step === 'email' && (
              <>
                <div className="relative mt-6">
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
                  className="w-full h-12 bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30 rounded-xl transition-all duration-300 transform hover:scale-[1.02] mt-4"
                >
                  <img
                    src="https://developers.google.com/identity/images/g-logo.png"
                    alt="Google"
                    className="w-5 h-5 mr-3"
                  />
                  Continue with Google
                </Button>
              </>
            )}

            <div className="text-center pt-6">
              <span className="text-white/70">Already have an account? </span>
              <Link 
                to="/login" 
                className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors duration-200"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;