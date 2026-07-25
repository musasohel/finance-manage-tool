import React, { useState } from 'react';
import { googleSignIn, emailSignIn, emailSignUp, resetPassword } from '../../firebase/auth';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Mail, Lock, User as UserIcon, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen }) => {
  const { enableGuestMode } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsSubmitting(true);
    const { error: err } = await googleSignIn();
    setIsSubmitting(false);
    if (err) setError(err);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    if (mode === 'forgot') {
      if (!email) {
        setError('Please enter your email address');
        setIsSubmitting(false);
        return;
      }
      const { error: err } = await resetPassword(email);
      setIsSubmitting(false);
      if (err) {
        setError(err);
      } else {
        setSuccess('Password reset link sent to your email address!');
      }
      return;
    }

    if (mode === 'signup') {
      if (!name || !email || !password) {
        setError('Please fill in all required fields');
        setIsSubmitting(false);
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        setIsSubmitting(false);
        return;
      }
      const { error: err } = await emailSignUp(email, password, name);
      setIsSubmitting(false);
      if (err) setError(err);
    } else {
      if (!email || !password) {
        setError('Please enter your email and password');
        setIsSubmitting(false);
        return;
      }
      const { error: err } = await emailSignIn(email, password);
      setIsSubmitting(false);
      if (err) setError(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#E5E7EB] p-8 transition-all">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-[#111827] text-white mb-3 shadow-sm">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-[#111827]">
            {mode === 'login' ? 'Welcome to Client Ledger' : mode === 'signup' ? 'Create Your Account' : 'Reset Password'}
          </h2>
          <p className="text-sm text-[#6B7280] mt-1">
            {mode === 'login'
              ? 'Manage clients, track payments, and generate invoices effortlessly'
              : mode === 'signup'
              ? 'Start organizing your freelance design workspace today'
              : 'Enter your email to receive a password reset link'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
            <Sparkles className="h-4 w-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Google Sign In Button */}
        {mode !== 'forgot' && (
          <>
            <button
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-3 bg-white border border-[#E5E7EB] hover:bg-gray-50 text-[#111827] font-medium py-2.5 px-4 rounded-xl text-sm transition-all shadow-2xs disabled:opacity-50"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E5E7EB]" />
              </div>
              <div className="relative flex justify-center text-xs text-[#6B7280]">
                <span className="bg-white px-2">or continue with email</span>
              </div>
            </div>
          </>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-[#6B7280]" />
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#111827]/20 focus:border-[#111827]"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#111827] mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-[#6B7280]" />
              <input
                type="email"
                placeholder="designer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#111827]/20 focus:border-[#111827]"
                required
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-[#111827]">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-xs text-[#6B7280] hover:text-[#111827] underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-[#6B7280]" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#111827]/20 focus:border-[#111827]"
                  required
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#111827] hover:bg-gray-800 text-white font-medium py-2.5 px-4 rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>
              {mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
            </span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Footer Mode Switch */}
        <div className="mt-6 pt-4 border-t border-[#E5E7EB] text-center space-y-2">
          {mode === 'login' ? (
            <p className="text-xs text-[#6B7280]">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="font-semibold text-[#111827] hover:underline"
              >
                Sign up
              </button>
            </p>
          ) : (
            <p className="text-xs text-[#6B7280]">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="font-semibold text-[#111827] hover:underline"
              >
                Sign in
              </button>
            </p>
          )}

          {/* Quick Demo Mode Access */}
          <div className="pt-2">
            <button
              type="button"
              onClick={enableGuestMode}
              className="inline-flex items-center gap-1.5 text-xs text-[#6B7280] hover:text-[#111827] transition-colors py-1 px-3 rounded-lg border border-dashed border-[#E5E7EB] hover:border-gray-400"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#F59E0B]" />
              <span>Explore Demo Mode (No Login Required)</span>
            </button>
          </div>

          {/* Developer Credit */}
          <div className="pt-3 border-t border-gray-100 text-center">
            <p className="text-[11px] text-[#6B7280]">
              Developed by{' '}
              <a
                href="https://v0-musasohel.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#111827] hover:underline hover:text-blue-600 transition-colors"
              >
                Mohammad Sohel
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
