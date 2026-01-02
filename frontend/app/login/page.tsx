'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import PureLogicsNavbar from '@/app/components/PureLogicsNavbar';
import { FiLock, FiUser } from 'react-icons/fi';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData.username, formData.password);
      router.push('/dashboard/my-courses');
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#000F2C] text-white">
      <PureLogicsNavbar />

      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-6 py-12">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="flex justify-center gap-2 mb-6">
              <div className="w-12 h-12 bg-[#66CC33] rounded-sm flex items-center justify-center">
                <div className="w-6 h-6 bg-[#4da826] rounded-sm"></div>
              </div>
              <div className="w-12 h-12 bg-[#66CC33] rounded-sm flex items-center justify-center">
                <div className="w-6 h-6 bg-[#4da826] rounded-sm"></div>
              </div>
            </div>
            <h2 className="text-3xl font-bold mb-2">Log in to continue your learning journey</h2>
          </div>

          <div className="bg-white rounded-sm p-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-sm text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-[#000F2C] mb-2">Email</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-sm text-[#000F2C] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#66CC33] focus:border-[#66CC33]"
                    placeholder="Email"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#66CC33] hover:bg-[#4da826] text-[#000F2C] py-3.5 rounded-sm font-bold text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Continue'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-[#6a6f73] mb-4">Other log in options</p>
              <div className="flex gap-3 justify-center">
                <button className="w-12 h-12 border-2 border-gray-300 rounded-sm flex items-center justify-center hover:border-[#66CC33] transition-colors">
                  <span className="text-lg font-bold text-[#000F2C]">G</span>
                </button>
                <button className="w-12 h-12 border-2 border-gray-300 rounded-sm flex items-center justify-center hover:border-[#66CC33] transition-colors">
                  <span className="text-lg font-bold text-[#000F2C]">f</span>
                </button>
                <button className="w-12 h-12 border-2 border-gray-300 rounded-sm flex items-center justify-center hover:border-[#66CC33] transition-colors">
                  <svg className="w-6 h-6 text-[#000F2C]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M15.6 10c0 .576-.373 1.066-.895 1.237L12.5 12.5l.5 2.5-2.5-.5-1.263 2.205c-.171.522-.661.895-1.237.895-.576 0-1.066-.373-1.237-.895L5.5 14.5l-2.5.5.5-2.5-1.263-2.205C2.373 11.066 2 10.576 2 10s.373-1.066.895-1.237L4.158 6.558 3.658 4.058l2.5.5 1.263-2.205C7.592 1.831 8.082 1.458 8.658 1.458c.576 0 1.066.373 1.237.895L11.158 4.558l2.5-.5-.5 2.5 1.263 2.205c.522.171.895.661.895 1.237z"/>
                  </svg>
                </button>
              </div>
            </div>

            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-[#6a6f73]">
                Don't have an account?{' '}
                <Link href="/register" className="text-[#66CC33] hover:text-[#4da826] font-semibold">
                  Sign up
                </Link>
              </p>
              <Link href="/login" className="block text-sm text-[#66CC33] hover:text-[#4da826] font-semibold">
                Log in with your organization
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
