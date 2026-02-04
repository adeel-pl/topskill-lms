'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import PureLogicsNavbar from '@/app/components/PureLogicsNavbar';
import { colors } from '@/lib/colors';
import { FiUser, FiBook, FiUsers, FiStar, FiArrowRight } from 'react-icons/fi';
import api from '@/lib/api';

interface Instructor {
  id: number;
  username: string;
  full_name: string;
  email: string;
  course_count: number;
  total_students: number;
  avg_rating: number;
  courses: Course[];
}

interface Course {
  id: number;
  title: string;
  slug: string;
  short_description: string;
  price: number;
  modality: string;
  thumbnail: string;
  enrolled_count: number;
  avg_rating: number;
  review_count: number;
}

export default function InstructorsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadInstructors();
  }, []);

  const loadInstructors = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/instructors/');
      
      if (response.data?.results && Array.isArray(response.data.results)) {
        setInstructors(response.data.results);
      } else if (Array.isArray(response.data)) {
        setInstructors(response.data);
      } else {
        setError('Unexpected response format from server.');
      }
    } catch (err: any) {
      console.error('Error loading instructors:', err);
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || err.message || 'Failed to load instructors. Please try again later.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: colors.background.primary }}>
        <PureLogicsNavbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 rounded-full animate-spin mx-auto mb-4" style={{ borderColor: colors.border.primary, borderTopColor: colors.primary }}></div>
            <p style={{ color: colors.text.muted }}>Loading instructors...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background.primary }}>
      <PureLogicsNavbar />
      
      <div className="section-after-header max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black mb-4" style={{ color: colors.text.dark }}>
            Our Instructors
          </h1>
          <p className="text-xl" style={{ color: colors.text.muted }}>
            Learn from the best instructors in their fields
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {instructors.length === 0 && !loading && !error ? (
          <div className="text-center py-12">
            <FiUser className="text-6xl mx-auto mb-4" style={{ color: colors.text.muted }} />
            <p className="text-xl" style={{ color: colors.text.muted }}>No instructors found</p>
          </div>
        ) : instructors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {instructors.map((instructor) => (
              <div
                key={instructor.id}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-200"
              >
                {/* Instructor Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold" style={{ backgroundColor: colors.primary }}>
                    {instructor.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-1" style={{ color: colors.text.dark }}>
                      {instructor.full_name}
                    </h3>
                    <p className="text-sm" style={{ color: colors.text.muted }}>
                      @{instructor.username}
                    </p>
                  </div>
                </div>

                {/* Instructor Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b border-gray-200">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <FiBook style={{ color: colors.primary }} />
                      <span className="text-lg font-bold" style={{ color: colors.text.dark }}>
                        {instructor.course_count}
                      </span>
                    </div>
                    <p className="text-xs" style={{ color: colors.text.muted }}>Courses</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <FiUsers style={{ color: colors.primary }} />
                      <span className="text-lg font-bold" style={{ color: colors.text.dark }}>
                        {instructor.total_students}
                      </span>
                    </div>
                    <p className="text-xs" style={{ color: colors.text.muted }}>Students</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <FiStar className="text-yellow-500" />
                      <span className="text-lg font-bold" style={{ color: colors.text.dark }}>
                        {(instructor.avg_rating || 0).toFixed(1)}
                      </span>
                    </div>
                    <p className="text-xs" style={{ color: colors.text.muted }}>Rating</p>
                  </div>
                </div>

                {/* Courses Preview */}
                {instructor.courses && instructor.courses.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold mb-2" style={{ color: colors.text.dark }}>
                      Recent Courses
                    </h4>
                    <div className="space-y-2">
                      {instructor.courses.slice(0, 3).map((course) => (
                        <Link
                          key={course.id}
                          href={`/courses/${course.slug}`}
                          className="block p-2 rounded-lg hover:bg-gray-50 transition-colors group"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate transition-colors" style={{ color: colors.text.dark }} onMouseEnter={(e) => e.currentTarget.style.color = colors.primary} onMouseLeave={(e) => e.currentTarget.style.color = colors.text.dark}>
                                {course.title}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs" style={{ color: colors.text.muted }}>
                                  ${course.price}
                                </span>
                                {course.avg_rating > 0 && (
                                  <>
                                    <span className="text-xs" style={{ color: colors.text.muted }}>•</span>
                                    <div className="flex items-center gap-1">
                                      <FiStar className="text-yellow-500 text-xs" />
                                      <span className="text-xs" style={{ color: colors.text.muted }}>
                                        {course.avg_rating.toFixed(1)}
                                      </span>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                            <FiArrowRight className="transition-colors ml-2" style={{ color: colors.text.muted }} onMouseEnter={(e) => e.currentTarget.style.color = colors.primary} onMouseLeave={(e) => e.currentTarget.style.color = colors.text.muted} />
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* View All Courses Button */}
                {instructor.courses && instructor.courses.length > 0 && (
                  <Link
                    href={`/instructors/${instructor.id}`}
                    className="block w-full text-center py-2 rounded-lg font-semibold text-sm transition-colors"
                    style={{
                      backgroundColor: colors.primary,
                      color: colors.text.white,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = colors.primaryHover;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = colors.primary;
                    }}
                  >
                    View All Courses
                  </Link>
                )}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
