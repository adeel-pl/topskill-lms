'use client';

import AdminLayout from '@/app/components/AdminLayout';
import { FiSettings, FiInfo } from 'react-icons/fi';

export default function AdminSettingsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-[#9CA3AF]">Manage system settings and configurations</p>
        </div>

        {/* Settings Content */}
        <div className="bg-[#0F172A] border border-[#334155] rounded-xl p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-[#10B981]/20 rounded-lg">
              <FiSettings className="text-2xl text-[#10B981]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">System Settings</h2>
              <p className="text-[#9CA3AF] text-sm">Configure your LMS settings</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-[#1E293B] border border-[#334155] rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <FiInfo className="text-[#3B82F6]" />
                <h3 className="text-white font-semibold">Settings Coming Soon</h3>
              </div>
              <p className="text-[#9CA3AF] text-sm">
                Advanced settings panel will be available here. For now, please use Django Admin for system configuration.
              </p>
              <a
                href="/admin/"
                target="_blank"
                className="inline-block mt-4 px-4 py-2 bg-[#10B981] text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-[#10B981]/30 transition-all"
              >
                Open Django Admin
              </a>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}


















