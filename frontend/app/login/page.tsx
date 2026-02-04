'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GoogleLogin } from '@react-oauth/google';
import { useAuthStore } from '@/lib/store';
import PureLogicsNavbar from '@/app/components/PureLogicsNavbar';
import { FiLock, FiUser, FiMail, FiArrowRight } from 'react-icons/fi';
import { colors } from '@/lib/colors';

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
    <div className="min-h-screen" style={{ backgroundColor: colors.background.primary, color: colors.text.dark }}>
      <style jsx global>{`
        input::placeholder {
          color: ${colors.text.muted} !important;
        }
      `}</style>
      <PureLogicsNavbar />

      <div className="section-after-header flex items-center justify-center min-h-[calc(100vh-80px)] px-4 sm:px-6 pb-12 md:pb-16 relative z-10">
        <div className="login-container-main max-w-[500px] xl:max-w-[600px] 2xl:max-w-[700px] mx-auto w-full px-4 sm:px-6">
          {/* Enhanced Header */}
          <div className="login-welcome-section text-center mb-12">
            <div className="login-welcome-icon inline-block mb-8">
              <div className="relative">
                <div className="login-welcome-icon-inner w-20 h-20 bg-[#048181] rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-[#048181]/50 transform hover:scale-110 transition-transform duration-300">
                  <div className="w-10 h-10 bg-[#0F172A] rounded-xl"></div>
                </div>
                <div className="login-welcome-icon-glow absolute inset-0 bg-[#048181] rounded-3xl opacity-20 blur-2xl animate-pulse"></div>
              </div>
            </div>
            <h2 className="login-welcome-title text-5xl md:text-6xl font-black mb-4 leading-tight" style={{ color: colors.text.dark }}>
              Welcome Back
            </h2>
            <p className="login-welcome-subtitle text-lg md:text-xl" style={{ color: colors.text.dark }}>Log in to continue your learning journey</p>
          </div>

          {/* Premium Form Card */}
          <div className="login-card rounded-3xl p-8 md:p-10 shadow-2xl transition-all duration-500" style={{ backgroundColor: colors.background.card, borderColor: colors.border.primary, borderWidth: '1px', borderStyle: 'solid' }}>
            <form className="login-form space-y-6" onSubmit={handleSubmit}>
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

              <div className="login-form-group">
                <label className="login-form-label block text-sm font-bold mb-3" style={{ color: colors.text.dark }}>Email or Username</label>
                <div className="login-input-wrapper relative group">
                  <div className="absolute inset-0 bg-[#048181]/0 rounded-xl group-focus-within:bg-[#048181]/10 transition-all duration-300"></div>
                  <FiMail className="login-input-icon absolute left-5 top-1/2 transform -translate-y-1/2 text-[#9CA3AF] group-focus-within:text-[#048181] transition-colors z-10" />
                  <input
                    type="text"
                    required
                    className="login-form-input relative w-full pl-14 pr-5 py-4 rounded-xl focus:outline-none focus:ring-2 transition-all"
                    style={{ 
                      backgroundColor: colors.background.secondary, 
                      borderColor: colors.border.primary, 
                      borderWidth: '2px', 
                      borderStyle: 'solid',
                      color: colors.text.dark,
                    }}
                    placeholder="Enter your email or username"
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

              <div className="login-form-group">
                <label className="login-form-label block text-sm font-bold mb-3" style={{ color: colors.text.dark }}>Password</label>
                <div className="login-input-wrapper relative group">
                  <div className="absolute inset-0 bg-[#048181]/0 rounded-xl group-focus-within:bg-[#048181]/10 transition-all duration-300"></div>
                  <FiLock className="login-input-icon absolute left-5 top-1/2 transform -translate-y-1/2 text-[#9CA3AF] group-focus-within:text-[#048181] transition-colors z-10" />
                  <input
                    type="password"
                    required
                    className="login-form-input relative w-full pl-14 pr-5 py-4 rounded-xl focus:outline-none focus:ring-2 transition-all"
                    style={{ 
                      backgroundColor: colors.background.secondary, 
                      borderColor: colors.border.primary, 
                      borderWidth: '2px', 
                      borderStyle: 'solid',
                      color: colors.text.dark,
                    }}
                    placeholder="Enter your password"
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

              <button
                type="submit"
                disabled={loading}
                className="login-submit-button w-full py-4 md:py-5 rounded-xl font-black text-base md:text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] hover:shadow-2xl flex items-center justify-center gap-2 group"
                style={{ 
                  backgroundColor: colors.button.primary, 
                  color: colors.text.white,
                  boxShadow: '0 10px 25px -5px rgba(4, 129, 129, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(4, 129, 129, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(4, 129, 129, 0.3)';
                }}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Signing in...
                  </>
                ) : (
                  <>
                    Continue
                    <FiArrowRight className="login-button-arrow text-xl group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Enhanced Social Login */}
            <div className="login-social-section mt-8 pt-8 border-t border-[#334155]">
              <p className="login-social-text text-center text-sm mb-6 font-medium" style={{ color: colors.text.muted }}>Or continue with</p>
              <div className="login-social-buttons-wrapper flex gap-4 justify-center items-center">
                <div className="relative">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    useOneTap={false}
                    shape="rectangular"
                    theme="filled_black"
                    size="large"
                    text="signin_with"
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
            <div className="login-footer mt-8 text-center space-y-4">
              <p className="login-footer-text text-sm" style={{ color: colors.text.muted }}>
                Don't have an account?{' '}
                <Link href="/register" className="login-footer-link font-bold transition-colors hover:underline" style={{ color: colors.accent.primary }}>
                  Sign up
                </Link>
              </p>
              <Link href="/forgot-password" className="login-forgot-link block text-sm font-semibold transition-colors hover:underline" style={{ color: colors.accent.primary }}>
                Forgot your password?
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
