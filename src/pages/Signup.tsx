import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';
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
  const [otpSent, setOtpSent] = useState(false);
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [otp, setOtp] = useState('');
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [otpVerified, setOtpVerified] = useState(false);
  const { register, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  useGoogleAuthCallback();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validateEmail = (email: string) => {
    return email.endsWith('@gmail.com');
  };

  // Step 1: Send OTP
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

  // Step 2: Verify OTP
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
        toast({ title: 'OTP Verified', description: 'You can now create your account.' });
      } else {
        toast({ title: 'Invalid OTP', description: 'Please check your OTP and try again.', variant: 'destructive' });
      }
    } catch {
      setLoading(false);
      toast({ title: 'Error', description: 'Failed to verify OTP.', variant: 'destructive' });
    }
  };

  // Step 3: Register (send OTP as well)
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
      // Pass OTP to register
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link to="/" className="flex items-center justify-center space-x-2 mb-6">
            <BookOpen className="w-10 h-10 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">EduFlow</span>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900">Join EduFlow</h2>
          <p className="mt-2 text-gray-600">Create your student account and start learning today</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create Your Account</CardTitle>
          </CardHeader>
          <CardContent>
            {step === 'email' ? (
              <form onSubmit={handleSendOtp} className="space-y-6">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Enter your Gmail address"
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">Must be a Gmail address</p>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Sending OTP...' : 'Send OTP'}
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
                  <span className="text-gray-600">Already have an account? </span>
                  <Link to="/login" className="text-blue-600 hover:text-blue-500 font-medium">
                    Sign in
                  </Link>
                </div>
              </form>
            ) : step === 'otp' && !otpVerified ? (
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div>
                  <Label htmlFor="otp">OTP</Label>
                  <Input
                    id="otp"
                    name="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    placeholder="Enter the OTP sent to your email"
                    className="mt-1"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Verifying OTP...' : 'Verify OTP'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter your full name"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Enter your Gmail address"
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">Must be a Gmail address</p>
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Create a password"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder="Confirm your password"
                    className="mt-1"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>

                <div className="text-center">
                  <span className="text-gray-600">Already have an account? </span>
                  <Link to="/login" className="text-blue-600 hover:text-blue-500 font-medium">
                    Sign in
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
