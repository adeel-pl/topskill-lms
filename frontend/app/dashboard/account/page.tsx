'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { authAPI } from '@/lib/api';
import { FiUser, FiSave, FiMail, FiLock } from 'react-icons/fi';
import { useToast } from '@/app/contexts/ToastContext';
import { Container } from '@/app/components/ui/container';
import { Heading } from '@/app/components/ui/heading';
import { Text } from '@/app/components/ui/text';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 rounded-full animate-spin mx-auto mb-4" style={{ borderColor: colors.border.primary, borderTopColor: colors.primary }}></div>
          <Text variant="muted">Loading...</Text>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-8 md:pb-12 bg-white">
      <Container size="2xl" className="pb-10 md:pb-12">
        <div className="mb-8 md:mb-12">
          <Heading as="h1" size="h1" className="mb-2">Account Settings</Heading>
          <Text variant="muted" size="lg">Manage your account information and preferences</Text>
        </div>

        <Card variant="default" className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
            <div>
              <label className="block text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: colors.text.dark }}>
                <FiUser style={{ color: colors.primary }} />
                Username
              </label>
              <input
                type="text"
                value={user?.username || ''}
                disabled
                className="w-full px-5 py-4 rounded-xl cursor-not-allowed"
                style={{ backgroundColor: colors.background.soft, borderColor: colors.border.primary, borderWidth: '1px', borderStyle: 'solid', color: colors.text.muted }}
              />
              <Text size="xs" variant="muted" className="mt-2">Username cannot be changed</Text>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: colors.text.dark }}>
                <FiMail style={{ color: colors.primary }} />
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-5 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all"
                style={{ backgroundColor: colors.background.soft, borderColor: colors.border.primary, borderWidth: '1px', borderStyle: 'solid', color: colors.text.dark }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = colors.primary;
                  e.currentTarget.style.boxShadow = `0 0 0 2px ${colors.primary}30`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = colors.border.primary;
                  e.currentTarget.style.boxShadow = '';
                }}
                placeholder="your.email@example.com"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="block text-sm font-semibold mb-3" style={{ color: colors.text.dark }}>First Name</label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className="w-full px-5 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all"
                style={{ backgroundColor: colors.background.soft, borderColor: colors.border.primary, borderWidth: '1px', borderStyle: 'solid', color: colors.text.dark }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = colors.primary;
                  e.currentTarget.style.boxShadow = `0 0 0 2px ${colors.primary}30`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = colors.border.primary;
                  e.currentTarget.style.boxShadow = '';
                }}
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-3" style={{ color: colors.text.dark }}>Last Name</label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className="w-full px-5 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all"
                style={{ backgroundColor: colors.background.soft, borderColor: colors.border.primary, borderWidth: '1px', borderStyle: 'solid', color: colors.text.dark }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = colors.primary;
                  e.currentTarget.style.boxShadow = `0 0 0 2px ${colors.primary}30`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = colors.border.primary;
                  e.currentTarget.style.boxShadow = '';
                }}
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="pt-6 md:pt-8" style={{ borderTopColor: colors.border.primary, borderTopWidth: '1px', borderTopStyle: 'solid' }}>
              <form onSubmit={handleChangePassword}>
                <div className="flex items-center gap-3 mb-4 md:mb-6">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${colors.primary}20` }}>
                    <FiLock className="text-xl" style={{ color: colors.primary }} />
                  </div>
                  <Heading as="h3" size="h4">Change Password</Heading>
                </div>
                <div className="space-y-4">
                  <input
                    type="password"
                    required
                    placeholder="Current Password"
                    value={passwordData.old_password}
                    onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
                    className="w-full px-5 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all"
                style={{ backgroundColor: colors.background.soft, borderColor: colors.border.primary, borderWidth: '1px', borderStyle: 'solid', color: colors.text.dark }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = colors.primary;
                  e.currentTarget.style.boxShadow = `0 0 0 2px ${colors.primary}30`;
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
                    className="w-full px-5 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all"
                style={{ backgroundColor: colors.background.soft, borderColor: colors.border.primary, borderWidth: '1px', borderStyle: 'solid', color: colors.text.dark }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = colors.primary;
                  e.currentTarget.style.boxShadow = `0 0 0 2px ${colors.primary}30`;
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
                    className="w-full px-5 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all"
                style={{ backgroundColor: colors.background.soft, borderColor: colors.border.primary, borderWidth: '1px', borderStyle: 'solid', color: colors.text.dark }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = colors.primary;
                  e.currentTarget.style.boxShadow = `0 0 0 2px ${colors.primary}30`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = colors.border.primary;
                  e.currentTarget.style.boxShadow = '';
                }}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={changingPassword}
                  variant="default"
                  className="mt-4 w-full"
                >
                  {changingPassword ? 'Changing...' : 'Change Password'}
                </Button>
              </form>
            </div>

            <Button
              type="submit"
              disabled={saving}
              variant="default"
              size="lg"
              className="w-full"
            >
              <FiSave className={saving ? 'animate-spin' : ''} />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </Card>
      </Container>
    </div>
  );
}
