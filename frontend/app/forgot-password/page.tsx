'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authAPI } from '@/lib/api';
import PureLogicsNavbar from '@/app/components/PureLogicsNavbar';
import { FiMail, FiArrowRight, FiCheckCircle } from 'react-icons/fi';
import { useToast } from '@/app/contexts/ToastContext';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.forgotPassword(email);
      // Check if response has message (success case)
      if (response.data?.message) {
        setSent(true);
        showSuccess(response.data.message || 'Password reset link sent to your email!');
      } else {
        setSent(true);
        showSuccess('Password reset link sent to your email!');
      }
    } catch (err: any) {
      console.error('Forgot password error details:', {
        error: err,
        response: err.response,
        data: err.response?.data,
        status: err.response?.status,
        message: err.message
      });
      
      let errorMessage = 'Failed to send reset link. Please try again.';
      
      if (err.response) {
        // Server responded with error
        errorMessage = err.response.data?.error || 
                      err.response.data?.message || 
                      err.response.data?.detail ||
                      `Server error: ${err.response.status}`;
      } else if (err.request) {
        // Request was made but no response received
        errorMessage = 'Network error: Unable to reach server. Please check your connection.';
      } else {
        // Something else happened
        errorMessage = err.message || 'An unexpected error occurred';
      }
      
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      <PureLogicsNavbar />

      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-[#366854] opacity-[0.08] rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-[#3B82F6] opacity-[0.06] rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="section-after-header flex items-center justify-center min-h-[calc(100vh-80px)] px-4 sm:px-6 pb-12 md:pb-16 relative z-10">
        <div className="max-w-[500px] xl:max-w-[600px] mx-auto w-full px-4 sm:px-6">
          <div className="text-center mb-12">
            <div className="inline-block mb-8">
              <div className="w-20 h-20 bg-[#366854] rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-[#366854]/50">
                <FiMail className="text-white text-3xl" />
              </div>
            </div>
            <h2 className="text-5xl md:text-6xl font-black mb-4 text-white leading-tight">
              Forgot Password?
            </h2>
            <p className="text-[#D1D5DB] text-lg md:text-xl">
              {sent 
                ? 'Check your email for reset instructions' 
                : 'Enter your email and we\'ll send you a reset link'}
            </p>
          </div>

          {sent ? (
            <div className="bg-[#1E293B]/90 backdrop-blur-xl border border-[#334155] rounded-3xl p-8 md:p-10 shadow-2xl">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#366854]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FiCheckCircle className="text-[#366854] text-4xl" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Email Sent!</h3>
                <p className="text-[#9CA3AF] mb-6">
                  We've sent a password reset link to <strong className="text-white">{email}</strong>
                </p>
                <p className="text-sm text-[#9CA3AF] mb-8">
                  Please check your inbox and click the link to reset your password. The link will expire in 24 hours.
                </p>
                <div className="space-y-4">
                  <Link
                    href="/login"
                    className="block w-full bg-[#366854] hover:bg-[#366854] text-white py-4 rounded-xl font-black transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#366854]/50"
                  >
                    Back to Login
                  </Link>
                  <button
                    onClick={() => setSent(false)}
                    className="block w-full border-2 border-[#334155] bg-[#0F172A]/50 text-white py-4 rounded-xl font-bold hover:border-[#366854] transition-all"
                  >
                    Send Another Email
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#1E293B]/90 backdrop-blur-xl border border-[#334155] rounded-3xl p-8 md:p-10 shadow-2xl">
              <form className="space-y-6" onSubmit={handleSubmit}>
                {mounted && error && (
                  <div className="bg-gradient-to-r from-[#EF4444]/20 to-[#DC2626]/20 border-2 border-[#EF4444]/50 text-[#FCA5A5] px-6 py-4 rounded-xl text-sm font-medium backdrop-blur-sm">
                    <div className="flex items-start gap-3">
                      <span className="text-lg flex-shrink-0">⚠️</span>
                      <div className="flex-1 min-w-0">
                        <strong className="block mb-1">Error:</strong>
                        <span className="break-words">{error}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setError('')}
                        className="text-[#FCA5A5] hover:text-white transition-colors flex-shrink-0 ml-2"
                        aria-label="Close error"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-bold text-white mb-3">Email Address</label>
                  <div className="relative group">
                    <FiMail className="absolute left-5 top-1/2 transform -translate-y-1/2 text-[#9CA3AF] group-focus-within:text-[#366854] transition-colors z-10" />
                    <input
                      type="email"
                      required
                      className="relative w-full pl-14 pr-5 py-4 bg-[#0F172A] border-2 border-[#334155] rounded-xl text-white placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#366854]/50 focus:border-[#366854] transition-all hover:bg-[#1E293B] hover:border-[#475569]"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError(''); // Clear error when user types
                      }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#366854] hover:bg-[#366854] text-white py-4 md:py-5 rounded-xl font-black text-base md:text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#366854]/50 flex items-center justify-center gap-2 group"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Reset Link
                      <FiArrowRight className="text-xl group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 text-center">
                <Link href="/login" className="text-sm text-[#366854] hover:text-[#34D399] font-semibold transition-colors hover:underline">
                  Back to Login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

