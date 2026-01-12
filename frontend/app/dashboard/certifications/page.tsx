'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { FiAward, FiBookOpen } from 'react-icons/fi';

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
          Certifications
        </h1>
        <p className="text-[#9CA3AF] text-base md:text-lg">Your earned certificates and achievements</p>
      </div>

      <div className="text-center py-16 md:py-20">
        <div className="bg-[#1E293B] border border-[#334155] rounded-2xl p-12 md:p-16 max-w-md mx-auto">
          <div className="w-20 md:w-24 h-20 md:h-24 bg-[#F59E0B]/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiAward className="text-4xl md:text-5xl text-[#F59E0B]" />
          </div>
          <h2 className="text-2xl md:text-3xl font-black mb-4 text-white">No certificates yet</h2>
          <p className="text-[#9CA3AF] mb-6 md:mb-8">Complete courses to earn certificates and showcase your achievements!</p>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 bg-[#10B981] text-white px-8 py-4 rounded-xl font-black transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#10B981]/50"
          >
            <FiBookOpen />
            Browse Courses
          </Link>
        </div>
      </div>
    </div>
  );
}
