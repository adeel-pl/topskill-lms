'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import PureLogicsNavbar from '@/app/components/PureLogicsNavbar';
import { colors } from '@/lib/colors';
import { FiUser, FiBook, FiUsers, FiStar, FiArrowLeft, FiClock, FiDollarSign } from 'react-icons/fi';
import api from '@/lib/api';
import CourseCard from '@/app/components/CourseCard';

interface Instructor {
  id: number;
  username: string;
  full_name: string;
  email: string;
  date_joined: string;
  bio?: string;
  statistics: {
    total_courses: number;
    total_students: number;
    avg_rating: number;
    total_reviews: number;
  };
  courses: Course[];
}

interface Course {
  id: number;
  title: string;
  slug: string;
  description: string;
  short_description: string;
  price: number;
  modality: string;
  thumbnail: string;
  enrolled_count: number;
  avg_rating: number;
  review_count: number;
  created_at: string;
}

export default function InstructorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [instructor, setInstructor] = useState<Instructor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (params.id) {
      loadInstructor(Number(params.id));
    }
  }, [params.id]);

  const loadInstructor = async (instructorId: number) => {
    try {
      setLoading(true);
      setError('');
      console.log('Loading instructor:', instructorId);
      const response = await api.get(`/instructors/${instructorId}/`);
      console.log('Instructor API response:', response.data);
      setInstructor(response.data);
    } catch (err: any) {
      console.error('Error loading instructor:', err);
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || err.message || 'Failed to load instructor. Please try again later.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: colors.background.primary }}>
        <PureLogicsNavbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-gray-300 border-t-[#048181] rounded-full animate-spin mx-auto mb-4"></div>
            <p style={{ color: colors.text.muted }}>Loading instructor...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: colors.background.primary }}>
        <PureLogicsNavbar />
        <div className="section-after-header max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-12">
            <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200">
              <p className="text-red-800">{error}</p>
            </div>
            <Link
              href="/instructors"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors"
              style={{
                backgroundColor: colors.accent.primary,
                color: 'white',
              }}
            >
              <FiArrowLeft />
              Back to Instructors
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!instructor) {
    return null;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background.primary }}>
      <PureLogicsNavbar />
      
      <div className="section-after-header max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link
          href="/instructors"
          className="inline-flex items-center gap-2 mb-8 text-sm font-medium transition-colors"
          style={{ color: colors.accent.primary }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#036969'}
          onMouseLeave={(e) => e.currentTarget.style.color = colors.accent.primary}
        >
          <FiArrowLeft />
          Back to Instructors
        </Link>

        {/* Instructor Header */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#048181] to-[#036969] flex items-center justify-center text-white text-4xl font-bold">
              {instructor.full_name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-black mb-2" style={{ color: colors.text.dark }}>
                {instructor.full_name}
              </h1>
              <p className="text-lg mb-1" style={{ color: colors.text.muted }}>
                @{instructor.username}
              </p>
              {instructor.bio && (
                <p className="text-base mt-2" style={{ color: colors.text.muted }}>
                  {instructor.bio}
                </p>
              )}
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 pt-8 border-t border-gray-200">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <FiBook className="text-2xl" style={{ color: colors.accent.primary }} />
                <span className="text-3xl font-black" style={{ color: colors.text.dark }}>
                  {instructor.statistics.total_courses}
                </span>
              </div>
              <p className="text-sm" style={{ color: colors.text.muted }}>Courses</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <FiUsers className="text-2xl" style={{ color: colors.accent.primary }} />
                <span className="text-3xl font-black" style={{ color: colors.text.dark }}>
                  {instructor.statistics.total_students}
                </span>
              </div>
              <p className="text-sm" style={{ color: colors.text.muted }}>Students</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <FiStar className="text-2xl text-yellow-500" />
                <span className="text-3xl font-black" style={{ color: colors.text.dark }}>
                  {instructor.statistics.avg_rating.toFixed(1)}
                </span>
              </div>
              <p className="text-sm" style={{ color: colors.text.muted }}>Rating</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <FiUsers className="text-2xl" style={{ color: colors.accent.primary }} />
                <span className="text-3xl font-black" style={{ color: colors.text.dark }}>
                  {instructor.statistics.total_reviews}
                </span>
              </div>
              <p className="text-sm" style={{ color: colors.text.muted }}>Reviews</p>
            </div>
          </div>
        </div>

        {/* Courses Section */}
        <div>
          <h2 className="text-3xl font-black mb-6" style={{ color: colors.text.dark }}>
            All Courses by {instructor.full_name}
          </h2>
          
          {instructor.courses && instructor.courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {instructor.courses.map((course, index) => (
                <CourseCard key={course.id} course={{
                  id: course.id,
                  title: course.title,
                  slug: course.slug,
                  description: course.short_description || course.description,
                  short_description: course.short_description,
                  price: course.price,
                  thumbnail: course.thumbnail,
                  instructor_name: instructor.full_name,
                  enrolled_count: course.enrolled_count,
                  average_rating: course.avg_rating,
                  rating_count: course.review_count,
                  modality: course.modality,
                }} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
              <FiBook className="text-6xl mx-auto mb-4" style={{ color: colors.text.muted }} />
              <p className="text-xl" style={{ color: colors.text.muted }}>No courses available yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


