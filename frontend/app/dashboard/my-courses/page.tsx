'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { enrollmentsAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { FiPlay, FiBookOpen, FiRefreshCw, FiClock, FiZap } from 'react-icons/fi';
import { Container } from '@/app/components/ui/container';
import { Heading } from '@/app/components/ui/heading';
import { Text } from '@/app/components/ui/text';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { colors } from '@/lib/colors';

interface Enrollment {
  id: number;
  course: {
    id: number;
    title: string;
    slug: string;
    modality: string;
    thumbnail?: string;
    featured_image?: string; // Added featured_image support
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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 rounded-full animate-spin mx-auto mb-4" style={{ borderColor: colors.border.primary, borderTopColor: colors.primary }}></div>
          <Text variant="muted">Loading your courses...</Text>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Container size="2xl" className="pb-10 md:pb-12">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4 mb-6 md:mb-8 lg:mb-12">
          <div>
            <Heading as="h1" size="h1" className="mb-2">My Courses</Heading>
            <Text variant="muted" size="lg">Continue your learning journey</Text>
          </div>
          <Button
            variant="light"
            onClick={refreshProgress}
            disabled={refreshing}
            className="whitespace-nowrap"
          >
            <FiRefreshCw className={`text-lg md:text-xl ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh Progress</span>
            <span className="sm:hidden">Refresh</span>
          </Button>
        </div>

        {enrollments.length === 0 ? (
          <div className="text-center py-16 md:py-20">
            <Card variant="default" className="p-10 md:p-12 lg:p-16 max-w-md mx-auto">
              <div className="w-20 md:w-24 h-20 md:h-24 rounded-full flex items-center justify-center mx-auto mb-5 md:mb-6" style={{ backgroundColor: `${colors.primary}20` }}>
                <FiBookOpen className="text-4xl md:text-5xl" style={{ color: colors.primary }} />
              </div>
              <Heading as="h2" size="h2" className="mb-3 md:mb-4">No courses yet</Heading>
              <Text variant="muted" size="base" className="mb-5 md:mb-6 lg:mb-8">Start learning by enrolling in a course!</Text>
              <Button asChild variant="default" size="lg">
                <Link href="/">Browse Courses</Link>
              </Button>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
            {enrollments.map((enrollment, idx) => {
              const progress = enrollment.progress_percent;
              const numProgress = typeof progress === 'number' ? progress : parseFloat(String(progress));
              const displayProgress = isNaN(numProgress) ? 0 : Math.max(0, Math.min(100, numProgress));
              
              return (
                <Card
                  key={enrollment.id}
                  variant="default"
                  hover={true}
                  className="h-full flex flex-col overflow-hidden"
                >
                  {/* Course Image - Use featured_image first, then thumbnail */}
                  <div className="relative w-full aspect-video overflow-hidden" style={{ backgroundColor: colors.primary }}>
                    {(enrollment.course.featured_image || enrollment.course.thumbnail) ? (
                      <img
                        src={enrollment.course.featured_image || enrollment.course.thumbnail}
                        alt={enrollment.course.title}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (target) target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-white text-5xl font-extrabold">
                          {enrollment.course.title?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Course Content */}
                  <div className="flex-1 flex flex-col p-5">
                    <div className="flex items-start justify-between mb-3">
                      <Heading as="h3" size="h5" className="flex-1 line-clamp-2">
                        {enrollment.course.title || 'Untitled Course'}
                      </Heading>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      <span className="px-3 py-1 rounded-lg text-xs font-semibold text-white" style={{ backgroundColor: colors.primary }}>
                        {enrollment.status?.toUpperCase() || 'ACTIVE'}
                      </span>
                      {enrollment.course.modality && (
                        <span className="px-3 py-1 rounded-lg text-xs font-semibold text-white" style={{ backgroundColor: colors.secondary }}>
                          {enrollment.course.modality.toUpperCase()}
                        </span>
                      )}
                    </div>

                    {/* Batch Information */}
                    {enrollment.batch && (
                      <Card variant="outlined" className="p-3 mb-3">
                        <div className="flex items-center gap-2">
                          <FiClock className="text-base" style={{ color: colors.primary }} />
                          <Text size="sm" variant="muted">
                            <span className="font-semibold" style={{ color: colors.text.dark }}>Batch:</span> {enrollment.batch.name}
                          </Text>
                        </div>
                      </Card>
                    )}

                    {/* Progress Section */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <Text size="sm" className="font-semibold flex items-center gap-1.5">
                          <FiZap className="text-sm" style={{ color: colors.primary }} />
                          Progress
                        </Text>
                        <Text size="lg" className="font-bold" style={{ color: colors.primary }}>
                          {(() => {
                            if (progress === null || progress === undefined) return '0.0';
                            const num = typeof progress === 'number' ? progress : parseFloat(String(progress));
                            return isNaN(num) ? '0.0' : num.toFixed(1);
                          })()}%
                        </Text>
                      </div>
                      <div className="w-full rounded-full h-3 overflow-hidden" style={{ backgroundColor: colors.background.soft }}>
                        <div
                          className="h-full rounded-full transition-all duration-1000"
                          style={{ width: `${displayProgress}%`, backgroundColor: colors.primary }}
                        />
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="mt-auto">
                      <Link 
                        href={`/learn/${enrollment.course.slug}`}
                        className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 text-base font-semibold text-white bg-[#366854] hover:bg-[#2a5242] rounded-[0.875rem] transition-all duration-300 shadow-md hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#366854] focus-visible:ring-offset-2"
                      >
                        <FiPlay className="text-lg flex-shrink-0" />
                        <span>Continue Learning</span>
                      </Link>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </Container>
    </div>
  );
}
