'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { enrollmentsAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { FiPlay, FiBookOpen, FiRefreshCw, FiClock, FiZap } from 'react-icons/fi';

interface Enrollment {
  id: number;
  course: {
    id: number;
    title: string;
    slug: string;
    modality: string;
    thumbnail?: string;
  };
  batch?: {
    id: number;
    name: string;
  };
  status: string;
  progress_percent?: number | string | null;
}

export default function MyCoursesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (isLoading) return;
    
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    loadEnrollments();
  }, [isAuthenticated, isLoading]);

  const loadEnrollments = async () => {
    const currentRequestId = ++requestIdRef.current;
    try {
      const response = await enrollmentsAPI.getAll();
      
      // Only update state if this is still the latest request (prevents race conditions)
      if (currentRequestId === requestIdRef.current) {
        setEnrollments(response.data.results || response.data || []);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error loading enrollments:', error);
      // Only update state if this is still the latest request
      if (currentRequestId === requestIdRef.current) {
        setEnrollments([]);
        setLoading(false);
      }
    }
  };

  const refreshProgress = async () => {
    setRefreshing(true);
    await loadEnrollments();
    setTimeout(() => setRefreshing(false), 500);
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#334155] border-t-[#10B981] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#9CA3AF]">Loading your courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-white pt-16 md:pt-20">
      {/* Subtle Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-40 right-20 w-96 h-96 bg-[#10B981] opacity-[0.05] rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-40 left-20 w-80 h-80 bg-[#3B82F6] opacity-[0.05] rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-[1400px] xl:max-w-[1600px] 2xl:max-w-[1800px] mx-auto w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 py-10 md:py-12 relative z-10">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4 mb-6 md:mb-8 lg:mb-12">
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-2 text-white">
              My Courses
            </h1>
            <p className="text-[#9CA3AF] text-sm md:text-base lg:text-lg">Continue your learning journey</p>
          </div>
          <button
            onClick={refreshProgress}
            disabled={refreshing}
            className="flex items-center gap-2 bg-[#1E293B] border border-[#334155] px-4 md:px-5 lg:px-6 py-2.5 md:py-3 rounded-xl font-semibold transition-all duration-300 hover:bg-[#334155] hover:border-[#10B981] hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap text-sm md:text-base"
          >
            <FiRefreshCw className={`text-lg md:text-xl ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh Progress</span>
            <span className="sm:hidden">Refresh</span>
          </button>
        </div>

        {enrollments.length === 0 ? (
          <div className="text-center py-16 md:py-20">
            <div className="bg-[#1E293B] border border-[#334155] rounded-2xl p-10 md:p-12 lg:p-16 max-w-md mx-auto">
              <div className="w-20 md:w-24 h-20 md:h-24 bg-[#10B981]/20 rounded-full flex items-center justify-center mx-auto mb-5 md:mb-6">
                <FiBookOpen className="text-4xl md:text-5xl text-[#10B981]" />
              </div>
              <h2 className="text-2xl md:text-3xl font-black mb-3 md:mb-4 text-white">No courses yet</h2>
              <p className="text-[#9CA3AF] mb-5 md:mb-6 lg:mb-8 text-sm md:text-base">Start learning by enrolling in a course!</p>
              <Link
                href="/courses"
                className="inline-block bg-[#10B981] text-white px-7 md:px-8 py-3.5 md:py-4 rounded-xl font-black transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#10B981]/50 text-sm md:text-base"
              >
                Browse Courses
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6 lg:gap-8">
            {enrollments.map((enrollment, idx) => {
              const progress = enrollment.progress_percent;
              const numProgress = typeof progress === 'number' ? progress : parseFloat(String(progress));
              const displayProgress = isNaN(numProgress) ? 0 : Math.max(0, Math.min(100, numProgress));
              
              return (
                <div
                  key={enrollment.id}
                  className="bg-[#1E293B] border border-[#334155] rounded-2xl overflow-hidden hover:bg-[#334155] hover:border-[#10B981] transition-all duration-500 hover:scale-105 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#10B981]/20"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  {/* Course Header */}
                  <div className="p-5 md:p-6 lg:p-8">
                    <div className="flex items-start justify-between mb-4 md:mb-5 lg:mb-6">
                      <h3 className="text-lg md:text-xl lg:text-2xl font-black text-white flex-1 transition-colors">
                        {enrollment.course.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 md:gap-3 flex-wrap mb-4 md:mb-5 lg:mb-6">
                      <span className={`px-2.5 md:px-3 lg:px-4 py-1 md:py-1.5 lg:py-2 rounded-xl text-xs font-black ${
                        enrollment.status === 'active' 
                          ? 'bg-[#10B981] text-white' 
                          : 'bg-[#6B7280] text-white'
                      }`}>
                        {enrollment.status.toUpperCase()}
                      </span>
                      <span className={`px-2.5 md:px-3 lg:px-4 py-1 md:py-1.5 lg:py-2 rounded-xl text-xs font-black ${
                        enrollment.course.modality === 'online' 
                          ? 'bg-[#8B5CF6] text-white' 
                          : enrollment.course.modality === 'hybrid' 
                          ? 'bg-[#3B82F6] text-white' 
                          : 'bg-[#F59E0B] text-white'
                      }`}>
                        {enrollment.course.modality.toUpperCase()}
                      </span>
                    </div>

                    {/* Batch Information */}
                    {enrollment.batch && (
                      <div className="mb-4 md:mb-5 lg:mb-6 p-3 md:p-4 bg-[#0F172A] border border-[#334155] rounded-xl">
                        <div className="flex items-center gap-2.5 md:gap-3">
                          <FiClock className="text-[#10B981] text-base md:text-lg lg:text-xl" />
                          <p className="text-xs md:text-sm lg:text-base text-[#D1D5DB]">
                            <span className="font-bold text-white">Batch:</span> {enrollment.batch.name}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Progress Section */}
                    <div className="mb-5 md:mb-6 lg:mb-8">
                      <div className="flex items-center justify-between mb-2.5 md:mb-3">
                        <span className="text-xs md:text-sm font-bold text-white flex items-center gap-1.5 md:gap-2">
                          <FiZap className="text-[#10B981] text-sm md:text-base" />
                          Progress
                        </span>
                        <span className="text-lg md:text-xl lg:text-2xl font-black text-[#10B981]">
                          {(() => {
                            if (progress === null || progress === undefined) return '0.0';
                            const num = typeof progress === 'number' ? progress : parseFloat(String(progress));
                            return isNaN(num) ? '0.0' : num.toFixed(1);
                          })()}%
                        </span>
                      </div>
                      <div className="w-full bg-[#0F172A] rounded-full h-2.5 md:h-3 lg:h-4 overflow-hidden">
                        <div
                          className="bg-[#10B981] h-full rounded-full transition-all duration-1000 shadow-lg shadow-[#10B981]/50"
                          style={{ 
                            width: `${displayProgress}%` 
                          }}
                        >
                          <div className="h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Link
                      href={`/learn/${enrollment.course.slug}`}
                      className="w-full bg-[#10B981] hover:bg-[#10B981] text-white px-5 md:px-6 py-3 md:py-3.5 lg:py-4 rounded-xl font-black transition-all duration-300 flex items-center justify-center gap-2 md:gap-3 hover:scale-105 hover:shadow-2xl hover:shadow-[#10B981]/50 text-sm md:text-base"
                    >
                      <FiPlay className="text-lg md:text-xl" />
                      Continue Learning
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
