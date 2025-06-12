import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

const ForgotPassword = () => {
  const [step, setStep] = useState<'email' | 'otp' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);
  const otpTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (otpCooldown > 0) {
      otpTimerRef.current = setTimeout(() => {
        setOtpCooldown(otpCooldown - 1);
      }, 1000);
    }
    return () => {
      if (otpTimerRef.current) clearTimeout(otpTimerRef.current);
    };
  }, [otpCooldown]);

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !email.endsWith('@gmail.com')) {
      toast({
        title: 'Invalid Email',
        description: 'Please use a Gmail address.',
        variant: 'destructive',
      });
      return;
    }
    if (otpCooldown > 0) return;
    setLoading(true);
    try {
      // Pass mode: 'forgot' to backend
      const response = await fetch(`${SERVER_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, mode: 'forgot' }),
      });
      const data = await response.json();
      setLoading(false);
      if (response.ok) {
        setStep('otp');
        setOtpCooldown(60);
        toast({ title: 'OTP Sent', description: 'Check your email for the OTP.' });
      } else if (data.message === 'User not found') {
        toast({
          title: 'User Not Found',
          description: 'No account found with this email.',
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
        body: JSON.stringify({ email, otp }),
      });
      setLoading(false);
      if (response.ok) {
        setStep('reset');
        toast({ title: 'OTP Verified', description: 'You can now reset your password.' });
      } else {
        const data = await response.json();
        toast({ title: 'Invalid OTP', description: data.message || 'Please check your OTP and try again.', variant: 'destructive' });
      }
    } catch (err) {
      setLoading(false);
      toast({ title: 'Failed to verify OTP', description: 'Try again.', variant: 'destructive' });
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Password Mismatch',
        description: 'Passwords do not match.',
        variant: 'destructive',
      });
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${SERVER_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      setLoading(false);
      if (response.ok) {
        toast({
          title: 'Password Reset Successful',
          description: 'You can now log in with your new password.',
        });
        navigate('/login');
      } else {
        const data = await response.json();
        toast({ title: 'Failed to reset password', description: data.message || 'Try again.', variant: 'destructive' });
      }
    } catch (err) {
      setLoading(false);
      toast({ title: 'Failed to reset password', description: 'Try again.', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Forgot Password</h2>
          <p className="mt-2 text-gray-600">Reset your password using your registered Gmail</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Reset Password</CardTitle>
          </CardHeader>
          <CardContent>
            {step === 'email' && (
              <form onSubmit={handleSendOtp} className="space-y-6">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="Enter your Gmail address"
                    className="mt-1"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading || otpCooldown > 0}
                >
                  {loading
                    ? 'Sending OTP...'
                    : otpCooldown > 0
                      ? `Resend OTP in ${otpCooldown}s`
                      : 'Send OTP'}
                </Button>
              </form>
            )}

            {step === 'otp' && (
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div>
                  <Label htmlFor="otp">Enter OTP</Label>
                  <Input
                    id="otp"
                    name="otp"
                    type="text"
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    required
                    placeholder="Enter the OTP sent to your email"
                    className="mt-1"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleSendOtp}
                  disabled={loading || otpCooldown > 0}
                >
                  {otpCooldown > 0 ? `Resend OTP in ${otpCooldown}s` : 'Resend OTP'}
                </Button>
              </form>
            )}

            {step === 'reset' && (
              <form onSubmit={handleResetPassword} className="space-y-6">
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                    placeholder="Enter new password"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Confirm new password"
                    className="mt-1"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Resetting...' : 'Reset Password'}
                </Button>
              </form>
            )}

            <div className="text-center mt-4">
              <Link to="/login" className="text-blue-600 hover:text-blue-500 font-medium">
                Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;