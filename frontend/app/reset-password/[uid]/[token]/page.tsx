'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { authAPI } from '@/lib/api';
import PureLogicsNavbar from '@/app/components/PureLogicsNavbar';
import { FiLock, FiCheckCircle, FiArrowRight } from 'react-icons/fi';
import { useToast } from '@/app/contexts/ToastContext';

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams();
  const { showSuccess, showError } = useToast();
  const [formData, setFormData] = useState({
    new_password: '',
    new_password2: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!params.uid || !params.token) {
      showError('Invalid reset link');
      router.push('/forgot-password');
    }
  }, [params, router, showError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.new_password !== formData.new_password2) {
      showError('Passwords do not match');
      return;
    }

    if (formData.new_password.length < 8) {
      showError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      await authAPI.resetPassword({
        uid: params.uid as string,
        token: params.token as string,
        new_password: formData.new_password,
      });
      setSuccess(true);
      showSuccess('Password reset successfully!');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      showError(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#0F172A] text-white pt-16 md:pt-20">
        <PureLogicsNavbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
          <div className="max-w-[500px] mx-auto text-center">
            <div className="w-16 h-16 bg-[#10B981]/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiCheckCircle className="text-[#10B981] text-4xl" />
            </div>
            <h2 className="text-4xl font-black mb-4">Password Reset Successful!</h2>
            <p className="text-[#9CA3AF] mb-8">Redirecting to login...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-white pt-16 md:pt-20">
      <PureLogicsNavbar />

      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-[#10B981] opacity-[0.08] rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-[#3B82F6] opacity-[0.06] rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 sm:px-6 py-12 md:py-16 relative z-10">
        <div className="max-w-[500px] xl:max-w-[600px] mx-auto w-full px-4 sm:px-6">
          <div className="text-center mb-12">
            <div className="inline-block mb-8">
              <div className="w-20 h-20 bg-[#10B981] rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-[#10B981]/50">
                <FiLock className="text-white text-3xl" />
              </div>
            </div>
            <h2 className="text-5xl md:text-6xl font-black mb-4 text-white leading-tight">
              Reset Password
            </h2>
            <p className="text-[#D1D5DB] text-lg md:text-xl">
              Enter your new password below
            </p>
          </div>

          <div className="bg-[#1E293B]/90 backdrop-blur-xl border border-[#334155] rounded-3xl p-8 md:p-10 shadow-2xl">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-bold text-white mb-3">New Password</label>
                <div className="relative group">
                  <FiLock className="absolute left-5 top-1/2 transform -translate-y-1/2 text-[#9CA3AF] group-focus-within:text-[#10B981] transition-colors z-10" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    className="relative w-full pl-14 pr-5 py-4 bg-[#0F172A] border-2 border-[#334155] rounded-xl text-white placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#10B981]/50 focus:border-[#10B981] transition-all hover:bg-[#1E293B] hover:border-[#475569]"
                    placeholder="Enter new password (min 8 characters)"
                    value={formData.new_password}
                    onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-white mb-3">Confirm New Password</label>
                <div className="relative group">
                  <FiLock className="absolute left-5 top-1/2 transform -translate-y-1/2 text-[#9CA3AF] group-focus-within:text-[#10B981] transition-colors z-10" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    className="relative w-full pl-14 pr-5 py-4 bg-[#0F172A] border-2 border-[#334155] rounded-xl text-white placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#10B981]/50 focus:border-[#10B981] transition-all hover:bg-[#1E293B] hover:border-[#475569]"
                    placeholder="Confirm new password"
                    value={formData.new_password2}
                    onChange={(e) => setFormData({ ...formData, new_password2: e.target.value })}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#10B981] hover:bg-[#10B981] text-white py-4 md:py-5 rounded-xl font-black text-base md:text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#10B981]/50 flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Resetting...
                  </>
                ) : (
                  <>
                    Reset Password
                    <FiArrowRight className="text-xl group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <Link href="/login" className="text-sm text-[#10B981] hover:text-[#34D399] font-semibold transition-colors hover:underline">
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}























