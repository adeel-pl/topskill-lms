'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GoogleLogin } from '@react-oauth/google';
import { useAuthStore } from '@/lib/store';
import PureLogicsNavbar from '@/app/components/PureLogicsNavbar';
import { FiUser, FiMail, FiLock, FiArrowRight } from 'react-icons/fi';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Heading } from '@/app/components/ui/heading';
import { Text } from '@/app/components/ui/text';
import { FormInput } from '@/app/components/ui/form-input';
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

  const handleGoogleSuccess = async (credentialResponse: any) => {
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
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google registration failed. Please try again.');
    setGoogleLoading(false);
  };

  return (
    <div className="min-h-screen bg-white">
      <PureLogicsNavbar />

      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 sm:px-6 pb-12 md:pb-16 relative z-10 pt-20">
        <div className="max-w-[500px] w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <Heading as="h1" size="h1" className="mb-2">Create an account</Heading>
            <Text variant="muted" size="sm">Start your learning journey today</Text>
          </div>

          {/* Form Card */}
          <Card variant="default" className="p-8 md:p-10">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="px-6 py-4 rounded-xl text-sm font-medium" style={{ backgroundColor: `${colors.status.error}15`, borderColor: colors.status.error, borderWidth: '1px', borderStyle: 'solid', color: colors.status.error }}>
                  <div className="flex items-start gap-3">
                    <span className="text-lg">⚠️</span>
                    <div>
                      <p className="font-bold mb-1">Registration Failed</p>
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* First Name and Last Name in a row */}
              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  label="First Name"
                  type="text"
                  placeholder="John"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  required
                />
                <FormInput
                  label="Last Name"
                  type="text"
                  placeholder="Doe"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  required
                />
              </div>

              <FormInput
                label="Username"
                type="text"
                placeholder="johndoe"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                icon={<FiUser className="w-5 h-5" />}
                required
              />

              <FormInput
                label="Email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                icon={<FiMail className="w-5 h-5" />}
                required
              />

              <FormInput
                label="Password"
                type="password"
                placeholder="At least 8 characters"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                icon={<FiLock className="w-5 h-5" />}
                required
              />

              <FormInput
                label="Confirm Password"
                type="password"
                placeholder="Confirm your password"
                value={formData.password2}
                onChange={(e) => setFormData({ ...formData, password2: e.target.value })}
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
                    Creating account...
                  </>
                ) : (
                  <>
                    Sign up
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
                    text="signup_with"
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
            <div className="mt-8 text-center">
              <Text size="sm" variant="muted">
                Already have an account?{' '}
                <Link href="/login" className="font-semibold hover:underline" style={{ color: colors.primary }}>
                  Log in
                </Link>
              </Text>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
