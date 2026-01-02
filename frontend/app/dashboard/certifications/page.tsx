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
        <h1 className="text-3xl font-bold text-[#000F2C] mb-1">Certifications</h1>
        <p className="text-[#6a6f73] text-sm">Your earned certificates and achievements</p>
      </div>

      <div className="text-center py-20 bg-gray-50 rounded-sm border border-gray-200">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
          <FiAward className="text-3xl text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold mb-2 text-[#000F2C]">No certificates yet</h2>
        <p className="text-[#6a6f73] mb-6">Complete courses to earn certificates and showcase your achievements!</p>
        <Link
          href="/courses"
          className="bg-[#66CC33] hover:bg-[#4da826] text-[#000F2C] px-6 py-3 rounded-sm font-semibold inline-block transition-all duration-200 flex items-center gap-2 mx-auto w-fit"
        >
          <FiBookOpen />
          Browse Courses
        </Link>
      </div>
    </div>
  );
}
