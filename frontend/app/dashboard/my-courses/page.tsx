'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { enrollmentsAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { FiPlay, FiBookOpen, FiRefreshCw, FiClock, FiZap } from 'react-icons/fi';
import { colors } from '@/lib/colors';

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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background.primary }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 rounded-full animate-spin mx-auto mb-4" style={{ borderColor: colors.border.primary, borderTopColor: colors.accent.primary }}></div>
          <p style={{ color: colors.text.muted }}>Loading your courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background.primary, color: colors.text.dark }}>

      <div className="max-w-[1400px] xl:max-w-[1600px] 2xl:max-w-[1800px] mx-auto w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 pb-10 md:pb-12 relative z-10">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4 mb-6 md:mb-8 lg:mb-12">
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-2" style={{ color: colors.text.dark }}>
              My Courses
            </h1>
            <p className="text-sm md:text-base lg:text-lg" style={{ color: colors.text.muted }}>Continue your learning journey</p>
          </div>
          <button
            onClick={refreshProgress}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 md:px-5 lg:px-6 py-2.5 md:py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap text-sm md:text-base"
            style={{ 
              backgroundColor: colors.background.card, 
              borderColor: colors.border.primary, 
              borderWidth: '1px', 
              borderStyle: 'solid',
              color: colors.text.dark
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = colors.accent.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = colors.border.primary;
            }}
          >
            <FiRefreshCw className={`text-lg md:text-xl ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh Progress</span>
            <span className="sm:hidden">Refresh</span>
          </button>
        </div>

        {enrollments.length === 0 ? (
          <div className="text-center py-16 md:py-20">
            <div className="rounded-2xl p-10 md:p-12 lg:p-16 max-w-md mx-auto" style={{ backgroundColor: colors.background.card, borderColor: colors.border.primary, borderWidth: '1px', borderStyle: 'solid' }}>
              <div className="w-20 md:w-24 h-20 md:h-24 rounded-full flex items-center justify-center mx-auto mb-5 md:mb-6" style={{ backgroundColor: `${colors.accent.primary}20` }}>
                <FiBookOpen className="text-4xl md:text-5xl" style={{ color: colors.accent.primary }} />
              </div>
              <h2 className="text-2xl md:text-3xl font-black mb-3 md:mb-4" style={{ color: colors.text.dark }}>No courses yet</h2>
              <p className="mb-5 md:mb-6 lg:mb-8 text-sm md:text-base" style={{ color: colors.text.muted }}>Start learning by enrolling in a course!</p>
              <Link
                href="/courses"
                className="inline-block px-7 md:px-8 py-3.5 md:py-4 rounded-xl font-black transition-all duration-300 hover:scale-105 hover:shadow-2xl text-sm md:text-base"
                style={{ 
                  backgroundColor: colors.button.primary, 
                  color: colors.text.white,
                  boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(16, 185, 129, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(16, 185, 129, 0.3)';
                }}
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
                  className="h-full flex flex-col rounded-2xl overflow-hidden transition-all duration-500 hover:scale-105 hover:-translate-y-2 hover:shadow-2xl"
                  style={{ 
                    backgroundColor: colors.background.card, 
                    borderColor: colors.border.primary, 
                    borderWidth: '1px', 
                    borderStyle: 'solid',
                    animationDelay: `${idx * 100}ms`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = colors.accent.primary;
                    e.currentTarget.style.boxShadow = `0 20px 25px -5px ${colors.accent.primary}20`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = colors.border.primary;
                    e.currentTarget.style.boxShadow = '';
                  }}
                >
                  {/* Course Image */}
                  <div className="relative w-full aspect-video overflow-hidden" style={{ backgroundColor: colors.accent.primary }}>
                    {enrollment.course.thumbnail ? (
                      <img
                        src={enrollment.course.thumbnail}
                        alt={enrollment.course.title}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-white text-5xl font-black drop-shadow-lg">{enrollment.course.title.charAt(0)}</span>
                      </div>
                    )}
                  </div>

                  {/* Course Header */}
                  <div className="flex-1 flex flex-col p-5 md:p-6 lg:p-8">
                    <div className="flex items-start justify-between mb-4 md:mb-5 lg:mb-6">
                      <h3 className="text-lg md:text-xl lg:text-2xl font-black flex-1 transition-colors" style={{ color: colors.text.dark }}>
                        {enrollment.course.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 md:gap-3 flex-wrap mb-4 md:mb-5 lg:mb-6">
                      <span className="px-2.5 md:px-3 lg:px-4 py-1 md:py-1.5 lg:py-2 rounded-xl text-xs font-black text-white" style={{ backgroundColor: enrollment.status === 'active' ? colors.accent.primary : colors.text.muted }}>
                        {enrollment.status.toUpperCase()}
                      </span>
                      <span className="px-2.5 md:px-3 lg:px-4 py-1 md:py-1.5 lg:py-2 rounded-xl text-xs font-black text-white" style={{ backgroundColor: colors.accent.blue }}>
                        {enrollment.course.modality.toUpperCase()}
                      </span>
                    </div>

                    {/* Batch Information */}
                    {enrollment.batch && (
                      <div className="mb-4 md:mb-5 lg:mb-6 p-3 md:p-4 rounded-xl" style={{ backgroundColor: colors.background.secondary, borderColor: colors.border.primary, borderWidth: '1px', borderStyle: 'solid' }}>
                        <div className="flex items-center gap-2.5 md:gap-3">
                          <FiClock className="text-base md:text-lg lg:text-xl" style={{ color: colors.accent.primary }} />
                          <p className="text-xs md:text-sm lg:text-base" style={{ color: colors.text.muted }}>
                            <span className="font-bold" style={{ color: colors.text.dark }}>Batch:</span> {enrollment.batch.name}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Progress Section */}
                    <div className="mb-5 md:mb-6 lg:mb-8">
                      <div className="flex items-center justify-between mb-2.5 md:mb-3">
                        <span className="text-xs md:text-sm font-bold flex items-center gap-1.5 md:gap-2" style={{ color: colors.text.dark }}>
                          <FiZap className="text-sm md:text-base" style={{ color: colors.accent.primary }} />
                          Progress
                        </span>
                        <span className="text-lg md:text-xl lg:text-2xl font-black" style={{ color: colors.accent.primary }}>
                          {(() => {
                            if (progress === null || progress === undefined) return '0.0';
                            const num = typeof progress === 'number' ? progress : parseFloat(String(progress));
                            return isNaN(num) ? '0.0' : num.toFixed(1);
                          })()}%
                        </span>
                      </div>
                      <div className="w-full rounded-full h-2.5 md:h-3 lg:h-4 overflow-hidden" style={{ backgroundColor: colors.background.secondary }}>
                        <div
                          className="h-full rounded-full transition-all duration-1000 shadow-lg"
                          style={{ 
                            width: `${displayProgress}%`,
                            backgroundColor: colors.accent.primary,
                            boxShadow: `0 0 10px ${colors.accent.primary}50`
                          }}
                        >
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="mt-auto">
                      <Link
                        href={`/learn/${enrollment.course.slug}`}
                        className="w-full px-5 md:px-6 py-3 md:py-3.5 lg:py-4 rounded-xl font-black transition-all duration-300 flex items-center justify-center gap-2 md:gap-3 hover:scale-105 hover:shadow-2xl text-sm md:text-base whitespace-nowrap"
                        style={{ 
                          backgroundColor: colors.button.primary, 
                          color: colors.text.white,
                          boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.3)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(16, 185, 129, 0.5)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(16, 185, 129, 0.3)';
                        }}
                      >
                        <FiPlay className="text-lg md:text-xl flex-shrink-0" />
                        <span>Continue Learning</span>
                      </Link>
                    </div>
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
