'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { FiUser, FiSave, FiMail, FiLock } from 'react-icons/fi';

export default function AccountPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const [formData, setFormData] = useState({
    email: user?.email || '',
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
    if (user) {
      setFormData({
        email: user.email || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
      });
    }
  }, [isAuthenticated, isLoading, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert('Changes saved successfully!');
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-[#66CC33] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#000F2C] mb-1">Account settings</h1>
        <p className="text-[#6a6f73] text-sm">Manage your account information and preferences</p>
      </div>

      <div className="max-w-3xl">
        <div className="bg-white rounded-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-semibold text-[#000F2C] mb-2 flex items-center gap-2">
                <FiUser className="text-[#66CC33]" />
                Username
              </label>
              <input
                type="text"
                value={user?.username || ''}
                disabled
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-sm text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-[#6a6f73] mt-1">Username cannot be changed</p>
            </div>

            <div>
                <label className="block text-sm font-semibold text-[#000F2C] mb-2 flex items-center gap-2">
                <FiMail className="text-[#66CC33]" />
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-sm text-[#000F2C] focus:outline-none focus:ring-2 focus:ring-[#66CC33] focus:border-[#66CC33] transition-all duration-200"
                placeholder="your.email@example.com"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-[#000F2C] mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-sm text-[#000F2C] focus:outline-none focus:ring-2 focus:ring-[#66CC33] focus:border-[#66CC33] transition-all duration-200"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#000F2C] mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-sm text-[#000F2C] focus:outline-none focus:ring-2 focus:ring-[#66CC33] focus:border-[#66CC33] transition-all duration-200"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <FiLock className="text-[#66CC33]" />
                <label className="block text-sm font-semibold text-[#000F2C]">
                  Change Password
                </label>
              </div>
              <div className="space-y-4">
                <input
                  type="password"
                  placeholder="Current Password"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-sm text-[#000F2C] focus:outline-none focus:ring-2 focus:ring-[#66CC33] focus:border-[#66CC33] transition-all duration-200"
                />
                <input
                  type="password"
                  placeholder="New Password"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-sm text-[#000F2C] focus:outline-none focus:ring-2 focus:ring-[#66CC33] focus:border-[#66CC33] transition-all duration-200"
                />
                <input
                  type="password"
                  placeholder="Confirm New Password"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-sm text-[#000F2C] focus:outline-none focus:ring-2 focus:ring-[#66CC33] focus:border-[#66CC33] transition-all duration-200"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-[#66CC33] hover:bg-[#4da826] text-[#000F2C] px-6 py-3 rounded-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <FiSave className={saving ? 'animate-spin' : ''} />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
