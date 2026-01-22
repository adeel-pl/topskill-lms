'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GoogleLogin } from '@react-oauth/google';
import { useAuthStore } from '@/lib/store';
import PureLogicsNavbar from '@/app/components/PureLogicsNavbar';
import { FiUser, FiMail, FiLock, FiArrowRight } from 'react-icons/fi';
import { colors } from '@/lib/colors';

export default function RegisterPage() {
  const router = useRouter();
  const { register, googleLogin } = useAuthStore();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    first_name: '',
    last_name: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.password2) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      await register(formData);
      router.push('/dashboard/my-courses');
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background.primary, color: colors.text.dark }}>
      <PureLogicsNavbar />

      <div className="section-after-header flex items-center justify-center min-h-[calc(100vh-80px)] px-4 sm:px-6 pb-12 md:pb-16 relative z-10">
        <div className="max-w-[500px] xl:max-w-[600px] 2xl:max-w-[700px] mx-auto w-full px-4 sm:px-6">
          {/* Enhanced Header */}
          <div className="text-center mb-12">
            <div className="inline-block mb-8">
              <div className="relative">
                <div className="w-20 h-20 bg-[#048181] rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-[#048181]/50 transform hover:scale-110 transition-transform duration-300">
                  <div className="w-10 h-10 bg-[#0F172A] rounded-xl"></div>
                </div>
                <div className="absolute inset-0 bg-[#048181] rounded-3xl opacity-20 blur-2xl animate-pulse"></div>
              </div>
            </div>
            <h2 className="text-5xl md:text-6xl font-black mb-4 leading-tight" style={{ color: colors.text.dark }}>
              Start Learning Today
            </h2>
            <p className="text-lg md:text-xl" style={{ color: colors.text.dark }}>Sign up and unlock unlimited learning</p>
          </div>

          {/* Premium Form Card */}
          <div className="rounded-3xl p-8 md:p-10 shadow-2xl transition-all duration-500" style={{ backgroundColor: colors.background.card, borderColor: colors.border.primary, borderWidth: '1px', borderStyle: 'solid' }}>
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-gradient-to-r from-[#EF4444]/20 to-[#DC2626]/20 border border-[#EF4444]/50 text-[#FCA5A5] px-6 py-4 rounded-xl text-sm font-medium backdrop-blur-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: colors.text.dark }}>First Name</label>
                  <input
                    type="text"
                    className="w-full px-5 py-4 rounded-xl focus:outline-none focus:ring-2 transition-all"
                    style={{ 
                      backgroundColor: colors.background.secondary, 
                      borderColor: colors.border.primary, 
                      borderWidth: '2px', 
                      borderStyle: 'solid',
                      color: colors.text.dark,
                      placeholderColor: colors.text.muted
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = colors.accent.primary;
                      e.currentTarget.style.boxShadow = `0 0 0 2px ${colors.accent.primary}50`;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = colors.border.primary;
                      e.currentTarget.style.boxShadow = '';
                    }}
                    placeholder="John"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: colors.text.dark }}>Last Name</label>
                  <input
                    type="text"
                    className="w-full px-5 py-4 rounded-xl focus:outline-none focus:ring-2 transition-all"
                    style={{ 
                      backgroundColor: colors.background.secondary, 
                      borderColor: colors.border.primary, 
                      borderWidth: '2px', 
                      borderStyle: 'solid',
                      color: colors.text.dark,
                      placeholderColor: colors.text.muted
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = colors.accent.primary;
                      e.currentTarget.style.boxShadow = `0 0 0 2px ${colors.accent.primary}50`;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = colors.border.primary;
                      e.currentTarget.style.boxShadow = '';
                    }}
                    placeholder="Doe"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-3" style={{ color: colors.text.dark }}>Username</label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-[#048181]/0 rounded-xl group-focus-within:bg-[#048181]/10 transition-all duration-300"></div>
                  <FiUser className="absolute left-5 top-1/2 transform -translate-y-1/2 text-[#9CA3AF] group-focus-within:text-[#048181] transition-colors z-10" />
                  <input
                    type="text"
                    required
                    className="relative w-full pl-14 pr-5 py-4 rounded-xl focus:outline-none focus:ring-2 transition-all"
                    style={{ 
                      backgroundColor: colors.background.secondary, 
                      borderColor: colors.border.primary, 
                      borderWidth: '2px', 
                      borderStyle: 'solid',
                      color: colors.text.dark,
                      placeholderColor: colors.text.muted
                    }}
                    placeholder="johndoe"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = colors.accent.primary;
                      e.currentTarget.style.boxShadow = `0 0 0 2px ${colors.accent.primary}50`;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = colors.border.primary;
                      e.currentTarget.style.boxShadow = '';
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-3" style={{ color: colors.text.dark }}>Email</label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-[#048181]/0 rounded-xl group-focus-within:bg-[#048181]/10 transition-all duration-300"></div>
                  <FiMail className="absolute left-5 top-1/2 transform -translate-y-1/2 text-[#9CA3AF] group-focus-within:text-[#048181] transition-colors z-10" />
                  <input
                    type="email"
                    required
                    className="relative w-full pl-14 pr-5 py-4 rounded-xl focus:outline-none focus:ring-2 transition-all"
                    style={{ 
                      backgroundColor: colors.background.secondary, 
                      borderColor: colors.border.primary, 
                      borderWidth: '2px', 
                      borderStyle: 'solid',
                      color: colors.text.dark,
                      placeholderColor: colors.text.muted
                    }}
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = colors.accent.primary;
                      e.currentTarget.style.boxShadow = `0 0 0 2px ${colors.accent.primary}50`;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = colors.border.primary;
                      e.currentTarget.style.boxShadow = '';
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-3" style={{ color: colors.text.dark }}>Password</label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-[#048181]/0 rounded-xl group-focus-within:bg-[#048181]/10 transition-all duration-300"></div>
                  <FiLock className="absolute left-5 top-1/2 transform -translate-y-1/2 text-[#9CA3AF] group-focus-within:text-[#048181] transition-colors z-10" />
                  <input
                    type="password"
                    required
                    className="relative w-full pl-14 pr-5 py-4 rounded-xl focus:outline-none focus:ring-2 transition-all"
                    style={{ 
                      backgroundColor: colors.background.secondary, 
                      borderColor: colors.border.primary, 
                      borderWidth: '2px', 
                      borderStyle: 'solid',
                      color: colors.text.dark,
                      placeholderColor: colors.text.muted
                    }}
                    placeholder="At least 8 characters"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = colors.accent.primary;
                      e.currentTarget.style.boxShadow = `0 0 0 2px ${colors.accent.primary}50`;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = colors.border.primary;
                      e.currentTarget.style.boxShadow = '';
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-3" style={{ color: colors.text.dark }}>Confirm Password</label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-[#048181]/0 rounded-xl group-focus-within:bg-[#048181]/10 transition-all duration-300"></div>
                  <FiLock className="absolute left-5 top-1/2 transform -translate-y-1/2 text-[#9CA3AF] group-focus-within:text-[#048181] transition-colors z-10" />
                  <input
                    type="password"
                    required
                    className="relative w-full pl-14 pr-5 py-4 rounded-xl focus:outline-none focus:ring-2 transition-all"
                    style={{ 
                      backgroundColor: colors.background.secondary, 
                      borderColor: colors.border.primary, 
                      borderWidth: '2px', 
                      borderStyle: 'solid',
                      color: colors.text.dark,
                      placeholderColor: colors.text.muted
                    }}
                    placeholder="Confirm your password"
                    value={formData.password2}
                    onChange={(e) => setFormData({ ...formData, password2: e.target.value })}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = colors.accent.primary;
                      e.currentTarget.style.boxShadow = `0 0 0 2px ${colors.accent.primary}50`;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = colors.border.primary;
                      e.currentTarget.style.boxShadow = '';
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 md:py-5 rounded-xl font-black text-base md:text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] hover:shadow-2xl flex items-center justify-center gap-2 group"
                style={{ 
                  backgroundColor: colors.button.primary, 
                  color: colors.text.white,
                  boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(16, 185, 129, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(16, 185, 129, 0.3)';
                }}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating account...
                  </>
                ) : (
                  <>
                    Sign up
                    <FiArrowRight className="text-xl group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Enhanced Social Login */}
            <div className="mt-8 pt-8" style={{ borderTopColor: colors.border.primary, borderTopWidth: '1px', borderTopStyle: 'solid' }}>
              <p className="text-center text-sm mb-6 font-medium" style={{ color: colors.text.muted }}>Or continue with</p>
              <div className="flex gap-4 justify-center items-center">
                <div className="relative">
                  <GoogleLogin
                    onSuccess={async (credentialResponse: any) => {
                      setGoogleLoading(true);
                      setError('');
                      try {
                        const user = await googleLogin(credentialResponse.credential);
                        if (user?.is_staff || user?.role === 'admin') {
                          router.push('/admin');
                        } else if (user?.is_instructor || user?.role === 'instructor') {
                          router.push('/admin');
                        } else {
                          router.push('/dashboard/my-courses');
                        }
                      } catch (err: any) {
                        const errorMessage = err.message || err.response?.data?.error || err.response?.data?.detail || 'Google registration failed. Please try again.';
                        setError(errorMessage);
                        console.error('Google registration error:', err);
                      } finally {
                        setGoogleLoading(false);
                      }
                    }}
                    onError={() => {
                      setError('Google registration failed. Please try again.');
                      setGoogleLoading(false);
                    }}
                    useOneTap={false}
                    shape="rectangular"
                    theme="filled_black"
                    size="large"
                    text="signup_with"
                    locale="en"
                  />
                  {googleLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-lg">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Enhanced Footer Link */}
            <div className="mt-8 text-center">
              <span className="text-sm" style={{ color: colors.text.muted }}>Already have an account? </span>
              <Link href="/login" className="font-bold transition-colors hover:underline" style={{ color: colors.accent.primary }}>
                Log in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
