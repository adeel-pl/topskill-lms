'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GoogleLogin } from '@react-oauth/google';
import { useAuthStore } from '@/lib/store';
import PureLogicsNavbar from '@/app/components/PureLogicsNavbar';
import { FiLock, FiMail, FiArrowRight } from 'react-icons/fi';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Heading } from '@/app/components/ui/heading';
import { Text } from '@/app/components/ui/text';
import { FormInput } from '@/app/components/ui/form-input';
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
      
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google login failed. Please try again.');
    setGoogleLoading(false);
  };

  return (
    <div className="min-h-screen bg-white">
      <PureLogicsNavbar />

      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 sm:px-6 pb-12 md:pb-16 relative z-10 pt-20">
        <div className="max-w-[500px] w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <Heading as="h1" size="h1" className="mb-2">Welcome back</Heading>
            <Text variant="muted" size="sm">Sign in to continue learning</Text>
          </div>

          {/* Form Card */}
          <Card variant="default" className="p-8 md:p-10">
            <form className="login-form space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="px-6 py-4 rounded-xl text-sm font-medium" style={{ backgroundColor: `${colors.status.error}15`, borderColor: colors.status.error, borderWidth: '1px', borderStyle: 'solid', color: colors.status.error }}>
                  <div className="flex items-start gap-3">
                    <span className="text-lg">⚠️</span>
                    <div>
                      <p className="font-bold mb-1">Login Failed</p>
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <FormInput
                label="Email"
                type="text"
                placeholder="you@example.com"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                icon={<FiMail className="w-5 h-5" />}
                required
              />

              <FormInput
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                icon={<FiLock className="w-5 h-5" />}
                required
              />

              <Button
                type="submit"
                disabled={loading}
                variant="default"
                size="lg"
                className="w-full"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <FiArrowRight className="text-xl" />
                  </>
                )}
              </Button>
            </form>

            {/* Social Login */}
            <div className="mt-8 pt-8" style={{ borderTopColor: colors.border.primary, borderTopWidth: '1px', borderTopStyle: 'solid' }}>
              <Text size="sm" variant="muted" className="text-center mb-6">Or continue with</Text>
              <div className="flex gap-4 justify-center items-center">
                <div className="relative">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    useOneTap={false}
                    shape="rectangular"
                    theme="outline"
                    size="large"
                    text="signin_with"
                  />
                  {googleLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-lg">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Links */}
            <div className="mt-8 text-center space-y-4">
              <Text size="sm" variant="muted">
                Don't have an account?{' '}
                <Link href="/register" className="font-semibold hover:underline" style={{ color: colors.primary }}>
                  Create one
                </Link>
              </Text>
              <Link href="/forgot-password" className="block text-sm font-semibold hover:underline" style={{ color: colors.primary }}>
                Forgot your password?
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
