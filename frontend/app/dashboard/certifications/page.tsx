'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { FiAward, FiBookOpen } from 'react-icons/fi';
import { colors } from '@/lib/colors';

export default function CertificationsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading]);

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
            Certifications
          </h1>
          <p className="text-base md:text-lg" style={{ color: colors.text.muted }}>Your earned certificates and achievements</p>
        </div>

        <div className="text-center py-16 md:py-20">
          <div className="rounded-2xl p-12 md:p-16 max-w-md mx-auto" style={{ backgroundColor: colors.background.card, borderColor: colors.border.primary, borderWidth: '1px', borderStyle: 'solid' }}>
            <div className="w-20 md:w-24 h-20 md:h-24 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: `${colors.accent.orange}20` }}>
              <FiAward className="text-4xl md:text-5xl" style={{ color: colors.accent.orange }} />
            </div>
            <h2 className="text-2xl md:text-3xl font-black mb-4" style={{ color: colors.text.dark }}>No certificates yet</h2>
            <p className="mb-6 md:mb-8" style={{ color: colors.text.muted }}>Complete courses to earn certificates and showcase your achievements!</p>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-black transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              style={{ backgroundColor: colors.button.primary, color: colors.text.white, boxShadow: `0 10px 25px -5px ${colors.accent.primary}30` }}
            >
              <FiBookOpen />
              Browse Courses
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
