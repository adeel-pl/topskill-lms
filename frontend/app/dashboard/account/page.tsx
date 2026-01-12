'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { authAPI } from '@/lib/api';
import { FiUser, FiSave, FiMail, FiLock } from 'react-icons/fi';
import { useToast } from '@/app/contexts/ToastContext';

export default function AccountPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const { showSuccess, showError } = useToast();
  const [formData, setFormData] = useState({
    email: user?.email || '',
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
  });
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    new_password2: '',
  });
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

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
    try {
      await authAPI.updateProfile(formData);
      showSuccess('Profile updated successfully!');
    } catch (err: any) {
      showError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.new_password !== passwordData.new_password2) {
      showError('New passwords do not match');
      return;
    }

    if (passwordData.new_password.length < 8) {
      showError('Password must be at least 8 characters');
      return;
    }

    setChangingPassword(true);
    try {
      await authAPI.changePassword(passwordData);
      showSuccess('Password changed successfully!');
      setPasswordData({ old_password: '', new_password: '', new_password2: '' });
    } catch (err: any) {
      showError(err.response?.data?.error || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#334155] border-t-[#10B981] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#9CA3AF]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 md:py-12 text-white">
      <div className="mb-8 md:mb-12">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-2 text-white">
          Account Settings
        </h1>
        <p className="text-[#9CA3AF] text-base md:text-lg">Manage your account information and preferences</p>
      </div>

      <div className="max-w-[1400px] xl:max-w-[1600px] 2xl:max-w-[1800px] mx-auto w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
        <div className="bg-[#1E293B] border border-[#334155] rounded-2xl p-6 md:p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
            <div>
              <label className="block text-sm font-bold text-white mb-3 flex items-center gap-2">
                <FiUser className="text-[#10B981]" />
                Username
              </label>
              <input
                type="text"
                value={user?.username || ''}
                disabled
                className="w-full px-5 py-4 bg-[#0F172A] border border-[#334155] rounded-xl text-[#9CA3AF] cursor-not-allowed"
              />
              <p className="text-xs text-[#6B7280] mt-2">Username cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-white mb-3 flex items-center gap-2">
                <FiMail className="text-[#10B981]" />
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-5 py-4 bg-[#0F172A] border border-[#334155] rounded-xl text-white placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-[#10B981] transition-all hover:bg-[#1E293B]"
                placeholder="your.email@example.com"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="block text-sm font-bold text-white mb-3">First Name</label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className="w-full px-5 py-4 bg-[#0F172A] border border-[#334155] rounded-xl text-white placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-[#10B981] transition-all hover:bg-[#1E293B]"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-white mb-3">Last Name</label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className="w-full px-5 py-4 bg-[#0F172A] border border-[#334155] rounded-xl text-white placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-[#10B981] transition-all hover:bg-[#1E293B]"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="pt-6 md:pt-8 border-t border-[#334155]">
              <form onSubmit={handleChangePassword}>
                <div className="flex items-center gap-3 mb-4 md:mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#10B981]/20 flex items-center justify-center">
                    <FiLock className="text-[#10B981] text-xl" />
                  </div>
                  <label className="block text-lg font-bold text-white">
                    Change Password
                  </label>
                </div>
                <div className="space-y-4">
                  <input
                    type="password"
                    required
                    placeholder="Current Password"
                    value={passwordData.old_password}
                    onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
                    className="w-full px-5 py-4 bg-[#0F172A] border border-[#334155] rounded-xl text-white placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-[#10B981] transition-all hover:bg-[#1E293B]"
                  />
                  <input
                    type="password"
                    required
                    minLength={8}
                    placeholder="New Password (min 8 characters)"
                    value={passwordData.new_password}
                    onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                    className="w-full px-5 py-4 bg-[#0F172A] border border-[#334155] rounded-xl text-white placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-[#10B981] transition-all hover:bg-[#1E293B]"
                  />
                  <input
                    type="password"
                    required
                    minLength={8}
                    placeholder="Confirm New Password"
                    value={passwordData.new_password2}
                    onChange={(e) => setPasswordData({ ...passwordData, new_password2: e.target.value })}
                    className="w-full px-5 py-4 bg-[#0F172A] border border-[#334155] rounded-xl text-white placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-[#10B981] transition-all hover:bg-[#1E293B]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="mt-4 w-full bg-[#10B981] hover:bg-[#10B981] text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 hover:shadow-xl"
                >
                  {changingPassword ? 'Changing...' : 'Change Password'}
                </button>
              </form>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-[#10B981] hover:bg-[#10B981] text-white px-6 py-4 rounded-xl font-black transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 hover:shadow-2xl hover:shadow-[#10B981]/50 flex items-center justify-center gap-2"
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
