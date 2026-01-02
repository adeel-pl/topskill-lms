'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { coursesAPI, cartAPI, playerAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import PureLogicsNavbar from '@/app/components/PureLogicsNavbar';
import { FiStar, FiUsers, FiClock, FiCheck, FiShoppingCart } from 'react-icons/fi';

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [course, setCourse] = useState<any>(null);
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    loadCourse();
  }, [params.slug]);

  const loadCourse = async () => {
    try {
      const coursesRes = await coursesAPI.getBySlug(params.slug as string);
      const courseData = coursesRes.data.results?.find((c: any) => c.slug === params.slug) || 
                         coursesRes.data.find((c: any) => c.slug === params.slug) ||
                         coursesRes.data.results?.[0] || 
                         coursesRes.data[0];
      
      if (!courseData) {
        router.push('/courses');
        return;
      }

      setCourse(courseData);

      try {
        const overviewRes = await playerAPI.getOverview(courseData.id);
        setOverview(overviewRes.data);
      } catch (error) {
        setOverview({
          stats: {
            total_sections: 0,
            total_lectures: 0,
            total_duration_hours: 0,
          }
        });
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading course:', error);
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    setEnrolling(true);
    try {
      await coursesAPI.enroll(course.id);
      router.push(`/learn/${course.slug}`);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    try {
      await cartAPI.addItem(course.id);
      router.push('/cart');
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Failed to add to cart';
      if (errorMsg.includes('already in cart')) {
        router.push('/cart');
      } else {
        alert(errorMsg);
      }
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-[#66CC33] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-[#000F2C]">Course not found</h2>
          <Link href="/courses" className="text-[#66CC33] hover:underline">Browse Courses</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <PureLogicsNavbar />

      <div className="max-w-[1344px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-3 text-[#000F2C] leading-tight">{course.title}</h1>
              <p className="text-lg text-[#6a6f73] leading-relaxed">{course.description}</p>
            </div>

            {/* What you'll learn */}
            <div className="bg-[#f7f9fa] border border-gray-200 rounded-sm p-6">
              <h2 className="text-xl font-bold mb-4 text-[#000F2C]">What you'll learn</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-start gap-3">
                  <FiCheck className="text-[#66CC33] text-lg mt-0.5 flex-shrink-0" />
                  <span className="text-[#1c1d1f] text-sm leading-relaxed">Complete course content</span>
                </div>
                <div className="flex items-start gap-3">
                  <FiCheck className="text-[#66CC33] text-lg mt-0.5 flex-shrink-0" />
                  <span className="text-[#1c1d1f] text-sm leading-relaxed">Certificate of completion</span>
                </div>
                <div className="flex items-start gap-3">
                  <FiCheck className="text-[#66CC33] text-lg mt-0.5 flex-shrink-0" />
                  <span className="text-[#1c1d1f] text-sm leading-relaxed">Quizzes and assignments</span>
                </div>
                <div className="flex items-start gap-3">
                  <FiCheck className="text-[#66CC33] text-lg mt-0.5 flex-shrink-0" />
                  <span className="text-[#1c1d1f] text-sm leading-relaxed">Lifetime access</span>
                </div>
              </div>
            </div>

            {/* Course Content */}
            <div className="bg-[#f7f9fa] border border-gray-200 rounded-sm p-6">
              <h2 className="text-xl font-bold mb-4 text-[#000F2C]">Course Content</h2>
              <div className="flex items-center gap-6 text-[#6a6f73] text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#1c1d1f]">{overview?.stats?.total_sections || 0}</span>
                  <span>sections</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#1c1d1f]">{overview?.stats?.total_lectures || 0}</span>
                  <span>lectures</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#1c1d1f]">{overview?.stats?.total_duration_hours || 0}h</span>
                  <span>total length</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Pricing Card */}
          <div className="lg:col-span-1">
            <div className="bg-white border-2 border-gray-300 rounded-sm p-6 sticky top-24 shadow-sm">
              <div className="mb-6">
                <div className="text-3xl font-bold text-[#000F2C]">
                  {formatPrice(course.price)}
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="w-full bg-[#66CC33] hover:bg-[#4da826] text-[#000F2C] py-3.5 rounded-sm font-bold text-base transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {enrolling ? 'Enrolling...' : 'Enroll Now'}
                </button>
                <button
                  onClick={handleAddToCart}
                  className="w-full border-2 border-[#1c1d1f] text-[#1c1d1f] py-3 rounded-sm font-semibold hover:bg-[#1c1d1f] hover:text-white transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <FiShoppingCart className="text-lg" />
                  Add to Cart
                </button>
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <FiStar className="text-[#e59819] text-base flex-shrink-0" />
                  <span className="text-[#6a6f73]">
                    {course.average_rating ? `${course.average_rating.toFixed(1)} rating` : 'No ratings yet'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FiUsers className="text-[#6a6f73] text-base flex-shrink-0" />
                  <span className="text-[#6a6f73]">{course.enrolled_count || 0} students</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiClock className="text-[#6a6f73] text-base flex-shrink-0" />
                  <span className="text-[#6a6f73]">
                    {overview?.stats?.total_duration_hours || 0} hours
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
