import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookOpen, Mail, Shield, Key, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

const ForgotPassword = () => {
  const [step, setStep] = useState<'email' | 'otp' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  const renderStepContent = () => {
    switch (step) {
      case 'email':
        return (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-cyan-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Reset Your Password</h3>
              <p className="text-cyan-200/80">Enter your email to receive a verification code</p>
            </div>

            <div>
              <Label htmlFor="email" className="text-white/90 text-sm font-medium">
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="Enter your Gmail address"
                className="mt-2 bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-cyan-400 focus:ring-cyan-400/20 rounded-xl h-12 transition-all duration-300"
              />
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
                <Shield className="w-8 h-8 text-cyan-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Enter Verification Code</h3>
              <p className="text-cyan-200/80">We've sent a code to {email}</p>
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
                onChange={e => setOtp(e.target.value)}
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

      case 'reset':
        return (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Key className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Create New Password</h3>
              <p className="text-cyan-200/80">Choose a strong password for your account</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="newPassword" className="text-white/90 text-sm font-medium">
                  New Password
                </Label>
                <div className="relative mt-2">
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                    placeholder="Enter new password"
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-cyan-400 focus:ring-cyan-400/20 rounded-xl h-12 pr-12 transition-all duration-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-cyan-400 transition-colors duration-200"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-white/90 text-sm font-medium">
                  Confirm New Password
                </Label>
                <div className="relative mt-2">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Confirm new password"
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
                  <span>Resetting...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Key className="w-5 h-5" />
                  <span>Reset Password</span>
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
              <h2 className="text-4xl font-bold text-white">Forgot Password</h2>
              <p className="text-cyan-200/80 text-lg">Reset your password using your registered Gmail</p>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="flex justify-center space-x-2 mb-8">
            {['email', 'otp', 'reset'].map((stepName, index) => (
              <div
                key={stepName}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  step === stepName
                    ? 'bg-cyan-400 scale-125'
                    : ['email', 'otp', 'reset'].indexOf(step) > index
                    ? 'bg-green-400'
                    : 'bg-white/20'
                }`}
              ></div>
            ))}
          </div>

          {/* Form Container */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl">
            {renderStepContent()}

            <div className="text-center mt-6 pt-6 border-t border-white/10">
              <Link 
                to="/login" 
                className="inline-flex items-center text-cyan-400 hover:text-cyan-300 font-medium transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;