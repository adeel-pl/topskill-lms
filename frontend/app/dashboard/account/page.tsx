'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { authAPI } from '@/lib/api';
import { FiUser, FiSave, FiMail, FiLock } from 'react-icons/fi';
import { useToast } from '@/app/contexts/ToastContext';
import { colors } from '@/lib/colors';

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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background.primary }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 rounded-full animate-spin mx-auto mb-4" style={{ borderColor: colors.border.primary, borderTopColor: colors.accent.primary }}></div>
          <p style={{ color: colors.text.muted }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 pb-8 md:pb-12" style={{ backgroundColor: colors.background.primary, color: colors.text.dark }}>
      <div className="max-w-container xl:max-w-container-xl 2xl:max-w-container-2xl mx-auto w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 pb-10 md:pb-12">
        <div className="mb-8 md:mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-2" style={{ color: colors.text.dark }}>
            Account Settings
          </h1>
          <p className="text-base md:text-lg" style={{ color: colors.text.muted }}>Manage your account information and preferences</p>
        </div>

        <div className="rounded-2xl p-6 md:p-8 shadow-2xl" style={{ backgroundColor: colors.background.card, borderColor: colors.border.primary, borderWidth: '1px', borderStyle: 'solid' }}>
          <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
            <div>
              <label className="block text-sm font-bold mb-3 flex items-center gap-2" style={{ color: colors.text.dark }}>
                <FiUser style={{ color: colors.accent.primary }} />
                Username
              </label>
              <input
                type="text"
                value={user?.username || ''}
                disabled
                className="w-full px-5 py-4 rounded-xl cursor-not-allowed"
                style={{ backgroundColor: colors.background.secondary, borderColor: colors.border.primary, borderWidth: '1px', borderStyle: 'solid', color: colors.text.muted }}
              />
              <p className="text-xs mt-2" style={{ color: colors.text.muted }}>Username cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-bold mb-3 flex items-center gap-2" style={{ color: colors.text.dark }}>
                <FiMail style={{ color: colors.accent.primary }} />
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-5 py-4 rounded-xl focus:outline-none focus:ring-2 transition-all"
                style={{ 
                  backgroundColor: colors.background.secondary, 
                  borderColor: colors.border.primary, 
                  borderWidth: '1px', 
                  borderStyle: 'solid', 
                  color: colors.text.dark,
                  placeholder: colors.text.muted
                }}
                placeholder="your.email@example.com"
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = colors.accent.primary;
                  e.currentTarget.style.boxShadow = `0 0 0 2px ${colors.accent.primary}20`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = colors.border.primary;
                  e.currentTarget.style.boxShadow = '';
                }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="block text-sm font-bold mb-3" style={{ color: colors.text.dark }}>First Name</label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className="w-full px-5 py-4 rounded-xl focus:outline-none focus:ring-2 transition-all"
                  style={{ 
                    backgroundColor: colors.background.secondary, 
                    borderColor: colors.border.primary, 
                    borderWidth: '1px', 
                    borderStyle: 'solid', 
                    color: colors.text.dark
                  }}
                  placeholder="John"
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = colors.accent.primary;
                    e.currentTarget.style.boxShadow = `0 0 0 2px ${colors.accent.primary}20`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = colors.border.primary;
                    e.currentTarget.style.boxShadow = '';
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-3" style={{ color: colors.text.dark }}>Last Name</label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className="w-full px-5 py-4 rounded-xl focus:outline-none focus:ring-2 transition-all"
                  style={{ 
                    backgroundColor: colors.background.secondary, 
                    borderColor: colors.border.primary, 
                    borderWidth: '1px', 
                    borderStyle: 'solid', 
                    color: colors.text.dark
                  }}
                  placeholder="Doe"
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = colors.accent.primary;
                    e.currentTarget.style.boxShadow = `0 0 0 2px ${colors.accent.primary}20`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = colors.border.primary;
                    e.currentTarget.style.boxShadow = '';
                  }}
                />
              </div>
            </div>

            <div className="pt-6 md:pt-8" style={{ borderTopColor: colors.border.primary, borderTopWidth: '1px', borderTopStyle: 'solid' }}>
              <form onSubmit={handleChangePassword}>
                <div className="flex items-center gap-3 mb-4 md:mb-6">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${colors.accent.primary}20` }}>
                    <FiLock style={{ color: colors.accent.primary }} className="text-xl" />
                  </div>
                  <label className="block text-lg font-bold" style={{ color: colors.text.dark }}>
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
                    className="w-full px-5 py-4 rounded-xl focus:outline-none focus:ring-2 transition-all"
                    style={{ 
                      backgroundColor: colors.background.secondary, 
                      borderColor: colors.border.primary, 
                      borderWidth: '1px', 
                      borderStyle: 'solid', 
                      color: colors.text.dark
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = colors.accent.primary;
                      e.currentTarget.style.boxShadow = `0 0 0 2px ${colors.accent.primary}20`;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = colors.border.primary;
                      e.currentTarget.style.boxShadow = '';
                    }}
                  />
                  <input
                    type="password"
                    required
                    minLength={8}
                    placeholder="New Password (min 8 characters)"
                    value={passwordData.new_password}
                    onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                    className="w-full px-5 py-4 rounded-xl focus:outline-none focus:ring-2 transition-all"
                    style={{ 
                      backgroundColor: colors.background.secondary, 
                      borderColor: colors.border.primary, 
                      borderWidth: '1px', 
                      borderStyle: 'solid', 
                      color: colors.text.dark
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = colors.accent.primary;
                      e.currentTarget.style.boxShadow = `0 0 0 2px ${colors.accent.primary}20`;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = colors.border.primary;
                      e.currentTarget.style.boxShadow = '';
                    }}
                  />
                  <input
                    type="password"
                    required
                    minLength={8}
                    placeholder="Confirm New Password"
                    value={passwordData.new_password2}
                    onChange={(e) => setPasswordData({ ...passwordData, new_password2: e.target.value })}
                    className="w-full px-5 py-4 rounded-xl focus:outline-none focus:ring-2 transition-all"
                    style={{ 
                      backgroundColor: colors.background.secondary, 
                      borderColor: colors.border.primary, 
                      borderWidth: '1px', 
                      borderStyle: 'solid', 
                      color: colors.text.dark
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = colors.accent.primary;
                      e.currentTarget.style.boxShadow = `0 0 0 2px ${colors.accent.primary}20`;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = colors.border.primary;
                      e.currentTarget.style.boxShadow = '';
                    }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="mt-4 w-full px-6 py-3 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 hover:shadow-xl"
                  style={{ backgroundColor: colors.button.primary, color: colors.text.white }}
                >
                  {changingPassword ? 'Changing...' : 'Change Password'}
                </button>
              </form>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full px-6 py-4 rounded-xl font-black transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 hover:shadow-2xl flex items-center justify-center gap-2"
              style={{ backgroundColor: colors.button.primary, color: colors.text.white, boxShadow: `0 10px 25px -5px ${colors.accent.primary}30` }}
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
