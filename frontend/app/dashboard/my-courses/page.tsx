'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { enrollmentsAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { FiPlay, FiBookOpen, FiRefreshCw, FiClock } from 'react-icons/fi';

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

  useEffect(() => {
    if (isLoading) return;
    
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    loadEnrollments();
  }, [isAuthenticated, isLoading]);

  const loadEnrollments = async () => {
    try {
      const response = await enrollmentsAPI.getAll();
      setEnrollments(response.data.results || response.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading enrollments:', error);
      setEnrollments([]);
      setLoading(false);
    }
  };

  const refreshProgress = async () => {
    setRefreshing(true);
    await loadEnrollments();
    setTimeout(() => setRefreshing(false), 500);
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-[#66CC33] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-white min-h-screen" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#000F2C] mb-1">My Courses</h1>
        </div>
        <button
          onClick={refreshProgress}
          disabled={refreshing}
          className="flex items-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 px-4 py-2 rounded-sm font-medium transition-all duration-200 text-sm text-[#000F2C] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FiRefreshCw className={`text-base ${refreshing ? 'animate-spin' : ''}`} />
          Refresh Progress
        </button>
      </div>

      {enrollments.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-sm border border-gray-200">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
            <FiBookOpen className="text-3xl text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-[#000F2C]">No courses yet</h2>
          <p className="text-[#6a6f73] mb-6">Start learning by enrolling in a course!</p>
          <Link
            href="/courses"
            className="bg-[#66CC33] hover:bg-[#4da826] text-[#000F2C] px-6 py-3 rounded-sm font-semibold inline-block transition-all duration-200"
          >
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {enrollments.map((enrollment) => (
            <div
              key={enrollment.id}
              className="bg-white border border-gray-200 rounded-sm hover:shadow-md transition-all duration-200 overflow-hidden"
            >
              {/* Course Header */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-[#000F2C] mb-4">
                  {enrollment.course.title}
                </h3>
                <div className="flex items-center gap-2 flex-wrap mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    enrollment.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {enrollment.status}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    enrollment.course.modality === 'online' 
                      ? 'bg-green-100 text-green-800' 
                      : enrollment.course.modality === 'hybrid' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {enrollment.course.modality.toUpperCase()}
                  </span>
                </div>

                {/* Batch Information */}
                {enrollment.batch && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-sm">
                    <div className="flex items-center gap-2">
                      <FiClock className="text-gray-500 text-sm" />
                      <p className="text-sm text-[#6a6f73]">
                        <span className="font-semibold">Batch:</span> {enrollment.batch.name}
                      </p>
                    </div>
                  </div>
                )}

                {/* Progress Section */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-[#000F2C]">Progress</span>
                    <span className="text-sm font-bold text-[#000F2C]">
                      {(() => {
                        const progress = enrollment.progress_percent;
                        if (progress === null || progress === undefined) return '0.0';
                        const numProgress = typeof progress === 'number' ? progress : parseFloat(String(progress));
                        return isNaN(numProgress) ? '0.0' : numProgress.toFixed(1);
                      })()}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-[#66CC33] h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${(() => {
                          const progress = enrollment.progress_percent;
                          if (progress === null || progress === undefined) return 0;
                          const numProgress = typeof progress === 'number' ? progress : parseFloat(String(progress));
                          return isNaN(numProgress) ? 0 : Math.max(0, Math.min(100, numProgress));
                        })()}%` 
                      }}
                    ></div>
                  </div>
                </div>

                {/* Action Button */}
                <Link
                  href={`/learn/${enrollment.course.slug}`}
                  className="w-full bg-[#66CC33] hover:bg-[#4da826] text-[#000F2C] px-6 py-3 rounded-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <FiPlay />
                  Continue Learning
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
