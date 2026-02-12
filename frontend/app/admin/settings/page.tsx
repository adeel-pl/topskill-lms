'use client';

import AdminLayout from '@/app/components/AdminLayout';
import { FiSettings, FiInfo } from 'react-icons/fi';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Heading } from '@/app/components/ui/heading';
import { Text } from '@/app/components/ui/text';
import { colors } from '@/lib/colors';

export default function AdminSettingsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <Heading as="h1" size="h1" className="mb-2 text-white">Settings</Heading>
          <Text variant="muted" className="text-white/70">Manage system settings and configurations</Text>
        </div>

        {/* Settings Content */}
        <Card variant="outlined" className="p-6" style={{ backgroundColor: colors.background.dark, borderColor: colors.border.dark }}>
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-lg" style={{ backgroundColor: `${colors.primary}20` }}>
              <FiSettings className="text-2xl" style={{ color: colors.primary }} />
            </div>
            <div>
              <Heading as="h2" size="h3" className="text-white">System Settings</Heading>
              <Text size="sm" variant="muted" className="text-white/70">Configure your LMS settings</Text>
            </div>
          </div>

          <div className="space-y-4">
            <Card variant="outlined" className="p-4" style={{ backgroundColor: '#1E293B', borderColor: colors.border.dark }}>
              <div className="flex items-center gap-3 mb-2">
                <FiInfo style={{ color: colors.status.info }} />
                <Heading as="h3" size="h4" className="text-white">Settings Coming Soon</Heading>
              </div>
              <Text size="sm" variant="muted" className="text-white/70">
                Advanced settings panel will be available here. For now, please use Django Admin for system configuration.
              </Text>
              <Button asChild variant="default" className="mt-4">
                <a href="/admin/" target="_blank">
                  Open Django Admin
                </a>
              </Button>
            </Card>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}























