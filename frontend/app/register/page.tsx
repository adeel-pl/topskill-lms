'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import PureLogicsNavbar from '@/app/components/PureLogicsNavbar';
import { FiUser, FiMail, FiLock } from 'react-icons/fi';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuthStore();
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
            <h2 className="text-3xl font-bold mb-2">Sign up and start learning</h2>
          </div>

          <div className="bg-white rounded-sm p-8">
            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-sm text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#000F2C] mb-2">First Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-sm text-[#000F2C] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#66CC33] focus:border-[#66CC33]"
                    placeholder="John"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#000F2C] mb-2">Last Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-sm text-[#000F2C] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#66CC33] focus:border-[#66CC33]"
                    placeholder="Doe"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#000F2C] mb-2">Username</label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-sm text-[#000F2C] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#66CC33] focus:border-[#66CC33]"
                    placeholder="johndoe"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#000F2C] mb-2">Email</label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-sm text-[#000F2C] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#66CC33] focus:border-[#66CC33]"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#000F2C] mb-2">Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-sm text-[#000F2C] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#66CC33] focus:border-[#66CC33]"
                    placeholder="At least 8 characters"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#000F2C] mb-2">Confirm Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-sm text-[#000F2C] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#66CC33] focus:border-[#66CC33]"
                    placeholder="Confirm your password"
                    value={formData.password2}
                    onChange={(e) => setFormData({ ...formData, password2: e.target.value })}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#66CC33] hover:bg-[#4da826] text-[#000F2C] py-3.5 rounded-sm font-bold text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating account...' : 'Sign up'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <span className="text-sm text-[#6a6f73]">Already have an account? </span>
              <Link href="/login" className="text-[#66CC33] hover:text-[#4da826] font-semibold">
                Log in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
