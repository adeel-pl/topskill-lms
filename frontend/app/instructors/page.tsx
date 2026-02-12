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
        {/* Hero Section - Blue Background to Match Main Hero */}
        <div className="relative mb-16 rounded-2xl overflow-hidden" style={{ backgroundColor: colors.primary, minHeight: '400px' }}>
          {/* Animated Background Effects */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute rounded-full opacity-5 blur-3xl" style={{ width: '400px', height: '400px', backgroundColor: colors.accent.cyan, top: '10%', left: '10%' }}></div>
            <div className="absolute rounded-full opacity-5 blur-3xl" style={{ width: '300px', height: '300px', backgroundColor: colors.accent.mint, bottom: '20%', right: '15%' }}></div>
          </div>
          <div className="relative z-10 flex items-center justify-center min-h-[400px] px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl">
              <div className="inline-block px-4 py-2 rounded-full mb-6" style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(10px)' }}>
                <span className="text-sm font-semibold text-white">Our Experts</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
                Learn From Industry Leaders
              </h1>
              <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
                Our instructors bring real-world experience from top tech companies like Google, Microsoft, Meta, and Amazon.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold mb-2" style={{ color: colors.text.dark }}>
              {instructors.length}+
            </div>
            <div className="text-sm md:text-base" style={{ color: colors.text.muted }}>Expert Instructors</div>
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold mb-2" style={{ color: colors.text.dark }}>
              10+
            </div>
            <div className="text-sm md:text-base" style={{ color: colors.text.muted }}>Years Avg Experience</div>
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold mb-2" style={{ color: colors.text.dark }}>
              4.8
            </div>
            <div className="text-sm md:text-base" style={{ color: colors.text.muted }}>Average Rating</div>
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold mb-2" style={{ color: colors.text.dark }}>
              7.4K+
            </div>
            <div className="text-sm md:text-base" style={{ color: colors.text.muted }}>Students Taught</div>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: colors.text.dark }}>
            Our Instructors
          </h2>
          <p className="text-base md:text-lg" style={{ color: colors.text.muted }}>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {instructors.map((instructor) => (
              <div
                key={instructor.id}
                className="bg-white rounded-2xl p-6 shadow-lg transition-all duration-300 border border-gray-200 hover:shadow-xl hover:-translate-y-1"
                style={{ borderColor: colors.border.primary }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = colors.accent.green;
                  e.currentTarget.style.boxShadow = `0 20px 25px -5px ${colors.accent.green}20`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = colors.border.primary;
                  e.currentTarget.style.boxShadow = '';
                }}
              >
                {/* Instructor Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold" style={{ backgroundColor: colors.primary }}>
                    {instructor.full_name && typeof instructor.full_name === 'string' && instructor.full_name.length > 0 ? instructor.full_name.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg md:text-xl font-bold mb-1" style={{ color: colors.text.dark }}>
                      {instructor.full_name}
                    </h3>
                    <p className="text-xs md:text-sm" style={{ color: colors.text.muted }}>
                      @{instructor.username}
                    </p>
                  </div>
                </div>

                {/* Instructor Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b border-gray-200">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <FiBook style={{ color: colors.primary }} />
                      <span className="text-base md:text-lg font-bold" style={{ color: colors.text.dark }}>
                        {instructor.course_count}
                      </span>
                    </div>
                    <p className="text-xs md:text-sm" style={{ color: colors.text.muted }}>Courses</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <FiUsers style={{ color: colors.primary }} />
                      <span className="text-base md:text-lg font-bold" style={{ color: colors.text.dark }}>
                        {instructor.total_students}
                      </span>
                    </div>
                    <p className="text-xs md:text-sm" style={{ color: colors.text.muted }}>Students</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <FiStar className="text-yellow-500" />
                      <span className="text-base md:text-lg font-bold" style={{ color: colors.text.dark }}>
                        {(instructor.avg_rating || 0).toFixed(1)}
                      </span>
                    </div>
                    <p className="text-xs md:text-sm" style={{ color: colors.text.muted }}>Rating</p>
                  </div>
                </div>

                {/* Courses Preview */}
                {instructor.courses && instructor.courses.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-xs md:text-sm font-semibold mb-2" style={{ color: colors.text.dark }}>
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
                              <p className="text-xs md:text-sm font-medium truncate transition-colors" style={{ color: colors.text.dark }} onMouseEnter={(e) => e.currentTarget.style.color = colors.primary} onMouseLeave={(e) => e.currentTarget.style.color = colors.text.dark}>
                                {course.title}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs md:text-sm" style={{ color: colors.text.muted }}>
                                  ${course.price}
                                </span>
                                {course.avg_rating && course.avg_rating > 0 && (
                                  <>
                                    <span className="text-xs" style={{ color: colors.text.muted }}>•</span>
                                    <div className="flex items-center gap-1">
                                      <FiStar className="text-yellow-500 text-xs" />
                                      <span className="text-xs" style={{ color: colors.text.muted }}>
                                        {typeof course.avg_rating === 'number' ? course.avg_rating.toFixed(1) : '0.0'}
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
                    className="block w-full text-center py-3 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-[1.02] shadow-md hover:shadow-lg"
                    style={{
                      backgroundColor: colors.accent.green,
                      color: colors.text.white,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = colors.hover.accent;
                      e.currentTarget.style.boxShadow = `0 10px 25px -5px ${colors.accent.green}40`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = colors.accent.green;
                      e.currentTarget.style.boxShadow = '';
                    }}
                  >
                    View Profile
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
