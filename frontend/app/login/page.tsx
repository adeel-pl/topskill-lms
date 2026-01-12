'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GoogleLogin } from '@react-oauth/google';
import { useAuthStore } from '@/lib/store';
import PureLogicsNavbar from '@/app/components/PureLogicsNavbar';
import { FiLock, FiUser, FiMail, FiArrowRight } from 'react-icons/fi';

export default function LoginPage() {
  const router = useRouter();
  const { login, googleLogin } = useAuthStore();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(formData.username, formData.password);
      
      // Redirect based on user role
      if (user?.is_staff || user?.role === 'admin') {
        // Admin goes to admin dashboard
        router.push('/admin');
      } else if (user?.is_instructor || user?.role === 'instructor') {
        // Instructor goes to admin dashboard (they use the same interface)
        router.push('/admin');
      } else {
        // Student goes to student dashboard
        router.push('/dashboard/my-courses');
      }
    } catch (err: any) {
      // Show detailed error message
      const errorMessage = err.message || err.response?.data?.error || err.response?.data?.detail || 'Login failed. Please check your credentials and try again.';
      setError(errorMessage);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setGoogleLoading(true);
    setError('');
    
    try {
      // Send the ID token (credential) to backend
      const user = await googleLogin(credentialResponse.credential);
      
      // Redirect based on user role
      if (user?.is_staff || user?.role === 'admin') {
        router.push('/admin');
      } else if (user?.is_instructor || user?.role === 'instructor') {
        router.push('/admin');
      } else {
        router.push('/dashboard/my-courses');
      }
    } catch (err: any) {
      const errorMessage = err.message || err.response?.data?.error || err.response?.data?.detail || 'Google login failed. Please try again.';
      setError(errorMessage);
      console.error('Google login error:', err);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google login failed. Please try again.');
    setGoogleLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-white pt-16 md:pt-20">
      <PureLogicsNavbar />

      {/* Enhanced Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-[#10B981] opacity-[0.08] rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-[#3B82F6] opacity-[0.06] rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#10B981] opacity-[0.03] rounded-full blur-3xl"></div>
      </div>

      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 sm:px-6 py-12 md:py-16 relative z-10">
        <div className="max-w-[500px] xl:max-w-[600px] 2xl:max-w-[700px] mx-auto w-full px-4 sm:px-6">
          {/* Enhanced Header */}
          <div className="text-center mb-12">
            <div className="inline-block mb-8">
              <div className="relative">
                <div className="w-20 h-20 bg-[#10B981] rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-[#10B981]/50 transform hover:scale-110 transition-transform duration-300">
                  <div className="w-10 h-10 bg-[#0F172A] rounded-xl"></div>
                </div>
                <div className="absolute inset-0 bg-[#10B981] rounded-3xl opacity-20 blur-2xl animate-pulse"></div>
              </div>
            </div>
            <h2 className="text-5xl md:text-6xl font-black mb-4 text-white leading-tight">
              Welcome Back
            </h2>
            <p className="text-[#D1D5DB] text-lg md:text-xl">Log in to continue your learning journey</p>
          </div>

          {/* Premium Form Card */}
          <div className="bg-[#1E293B]/90 backdrop-blur-xl border border-[#334155] rounded-3xl p-8 md:p-10 shadow-2xl hover:border-[#10B981]/50 transition-all duration-500">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-gradient-to-r from-[#EF4444]/20 to-[#DC2626]/20 border border-[#EF4444]/50 text-[#FCA5A5] px-6 py-4 rounded-xl text-sm font-medium backdrop-blur-sm">
                  <div className="flex items-start gap-3">
                    <span className="text-lg">⚠️</span>
                    <div>
                      <p className="font-bold mb-1">Login Failed</p>
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-white mb-3">Email or Username</label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-[#10B981]/0 rounded-xl group-focus-within:bg-[#10B981]/10 transition-all duration-300"></div>
                  <FiMail className="absolute left-5 top-1/2 transform -translate-y-1/2 text-[#9CA3AF] group-focus-within:text-[#10B981] transition-colors z-10" />
                  <input
                    type="text"
                    required
                    className="relative w-full pl-14 pr-5 py-4 bg-[#0F172A] border-2 border-[#334155] rounded-xl text-white placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#10B981]/50 focus:border-[#10B981] transition-all hover:bg-[#1E293B] hover:border-[#475569]"
                    placeholder="Enter your email or username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-white mb-3">Password</label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-[#10B981]/0 rounded-xl group-focus-within:bg-[#10B981]/10 transition-all duration-300"></div>
                  <FiLock className="absolute left-5 top-1/2 transform -translate-y-1/2 text-[#9CA3AF] group-focus-within:text-[#10B981] transition-colors z-10" />
                  <input
                    type="password"
                    required
                    className="relative w-full pl-14 pr-5 py-4 bg-[#0F172A] border-2 border-[#334155] rounded-xl text-white placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#10B981]/50 focus:border-[#10B981] transition-all hover:bg-[#1E293B] hover:border-[#475569]"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
                    Signing in...
                  </>
                ) : (
                  <>
                    Continue
                    <FiArrowRight className="text-xl group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Enhanced Social Login */}
            <div className="mt-8 pt-8 border-t border-[#334155]">
              <p className="text-center text-sm text-[#9CA3AF] mb-6 font-medium">Or continue with</p>
              <div className="flex gap-4 justify-center items-center">
                <div className="relative">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    useOneTap={false}
                    shape="rectangular"
                    theme="filled_black"
                    size="large"
                    text="signin_with"
                    locale="en"
                  />
                  {googleLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#1E293B]/80 rounded-lg">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                {/* Facebook login - Hidden for now, can be enabled later */}
                {/* <button
                  className="w-14 h-14 border-2 border-[#334155] rounded-xl flex items-center justify-center hover:bg-[#1877F2]/20 hover:border-[#1877F2] transition-all duration-300 hover:scale-110 text-white font-bold text-lg backdrop-blur-sm opacity-50 cursor-not-allowed"
                  title="Facebook (Coming Soon)"
                  disabled
                >
                  f
                </button> */}
                {/* Microsoft login - Hidden for now, can be enabled later */}
                {/* <button
                  className="w-14 h-14 border-2 border-[#334155] rounded-xl flex items-center justify-center hover:bg-[#00A4EF]/20 hover:border-[#00A4EF] transition-all duration-300 hover:scale-110 text-white font-bold text-lg backdrop-blur-sm opacity-50 cursor-not-allowed"
                  title="Microsoft (Coming Soon)"
                  disabled
                >
                  M
                </button> */}
              </div>
            </div>

            {/* Enhanced Footer Links */}
            <div className="mt-8 text-center space-y-4">
              <p className="text-sm text-[#9CA3AF]">
                Don't have an account?{' '}
                <Link href="/register" className="text-[#10B981] hover:text-[#34D399] font-bold transition-colors hover:underline">
                  Sign up
                </Link>
              </p>
              <Link href="/forgot-password" className="block text-sm text-[#10B981] hover:text-[#34D399] font-semibold transition-colors hover:underline">
                Forgot your password?
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
