'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { coursesAPI, cartAPI, playerAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import PureLogicsNavbar from '@/app/components/PureLogicsNavbar';
import { Star, Users, Clock, Check, ShoppingCart, Play, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/app/contexts/ToastContext';

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { showSuccess, showError, showInfo } = useToast();
  const [course, setCourse] = useState<any>(null);
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    loadCourse();
  }, [params.slug]);

  const loadCourse = async () => {
    try {
      const coursesRes = await coursesAPI.getBySlug(params.slug as string);
      
      // Handle different API response formats
      let courseData = null;
      if (coursesRes.data.results && coursesRes.data.results.length > 0) {
        // If results array exists, find exact slug match
        courseData = coursesRes.data.results.find((c: any) => c.slug === params.slug);
      } else if (Array.isArray(coursesRes.data)) {
        // If data is directly an array
        courseData = coursesRes.data.find((c: any) => c.slug === params.slug);
      } else if (coursesRes.data.slug === params.slug) {
        // If data is a single course object
        courseData = coursesRes.data;
      }
      
      if (!courseData) {
        console.error('Course not found for slug:', params.slug);
        router.push('/courses');
        return;
      }

      setCourse(courseData);

      try {
        const overviewRes = await playerAPI.getOverview(courseData.id);
        setOverview(overviewRes.data);
        // Check enrollment status
        setIsEnrolled(overviewRes.data?.enrollment?.enrolled || false);
      } catch (error) {
        console.error('Error loading overview:', error);
        // Fallback to course data if overview fails
        setOverview({
          stats: {
            total_sections: courseData.total_sections || courseData.sections?.length || 0,
            total_lectures: courseData.total_lectures || 0,
            total_duration_hours: courseData.total_duration_hours || 0,
          },
          learning_objectives: [
            'Complete course content',
            'Certificate of completion',
            'Quizzes and assignments',
            'Lifetime access',
          ],
          enrollment: {
            enrolled: false,
          }
        });
        setIsEnrolled(false);
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
      showSuccess('Successfully enrolled! Redirecting to course...');
      setTimeout(() => {
        router.push(`/learn/${course.slug}`);
      }, 1500);
    } catch (error: any) {
      showError(error.response?.data?.error || 'Enrollment failed');
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
      showSuccess('Course added to cart!');
      setTimeout(() => {
        router.push('/cart');
      }, 1000);
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Failed to add to cart';
      if (errorMsg.includes('already in cart')) {
        showInfo('Course is already in your cart');
        setTimeout(() => {
          router.push('/cart');
        }, 1000);
      } else {
        showError(errorMsg);
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
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#334155] border-t-[#10B981] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#9CA3AF]">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-black mb-4 text-white">Course not found</h2>
          <Link href="/courses" className="text-[#10B981] hover:underline font-semibold">Browse Courses</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-white pt-20">
      <PureLogicsNavbar />

      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-[#10B981] opacity-[0.06] rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-[#3B82F6] opacity-[0.05] rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-[1400px] xl:max-w-[1600px] 2xl:max-w-[1800px] mx-auto w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 py-12 relative z-10">
        {/* Course Thumbnail */}
        {course.thumbnail && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10 rounded-3xl overflow-hidden border-2 border-[#334155] shadow-2xl"
          >
            <div className="relative w-full h-80 lg:h-96 bg-gradient-to-br from-[#10B981] via-[#3B82F6] to-[#8B5CF6]">
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              {course.modality && (
                <div className="absolute top-6 right-6">
                  <span className={`px-4 py-2 rounded-xl text-sm font-black backdrop-blur-md border-2 shadow-xl ${
                    course.modality === 'online' 
                      ? 'bg-[#10B981] text-white border-[#10B981]' 
                      : course.modality === 'hybrid'
                      ? 'bg-[#8B5CF6] text-white border-[#8B5CF6]'
                      : 'bg-[#F59E0B] text-white border-[#F59E0B]'
                  }`}>
                    {course.modality === 'online' ? 'ONLINE' : course.modality.toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            {/* Course Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 text-white leading-tight">
                {course.title}
              </h1>
              
              {/* Instructor and Rating Info */}
              <div className="flex items-center gap-4 md:gap-6 mb-6 md:mb-8 flex-wrap">
                {(course.instructor_name || overview?.course?.instructor?.name) && (
                  <div className="flex items-center gap-3 bg-[#1E293B]/50 backdrop-blur-sm border border-[#334155] rounded-xl px-4 md:px-5 py-3 md:py-3.5 hover:border-[#10B981]/50 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#10B981]/30">
                      <User className="text-white w-5 h-5" />
                    </div>
                    <div className="ml-2">
                      <p className="text-xs text-[#9CA3AF] font-medium mb-1">Instructor</p>
                      <p className="text-base font-bold text-white">
                        {course.instructor_name || overview?.course?.instructor?.name || 'John Instructor'}
                      </p>
                    </div>
                  </div>
                )}
                {course.average_rating && course.average_rating > 0 && (
                  <div className="flex items-center gap-2 bg-[#1E293B]/50 backdrop-blur-sm border border-[#334155] rounded-xl px-4 md:px-5 py-3 md:py-3.5 hover:border-[#10B981]/50 transition-colors">
                    <div className="flex items-center gap-1.5">
                      <Star className="text-[#10B981] fill-[#10B981] w-5 h-5" />
                      <span className="text-xl font-black text-white">{course.average_rating.toFixed(1)}</span>
                    </div>
                    {course.rating_count && (
                      <span className="text-sm text-[#9CA3AF] ml-2">
                        ({course.rating_count > 1000 ? `${(course.rating_count / 1000).toFixed(1)}K` : course.rating_count} ratings)
                      </span>
                    )}
                  </div>
                )}
                {((course.enrolled_count || overview?.course?.total_students || 0) > 0) && (
                  <div className="flex items-center gap-2 bg-[#1E293B]/50 backdrop-blur-sm border border-[#334155] rounded-xl px-4 md:px-5 py-3 md:py-3.5 text-[#9CA3AF] hover:border-[#10B981]/50 transition-colors">
                    <Users className="w-5 h-5" />
                    <span className="text-sm font-medium ml-1">
                      {course.enrolled_count || overview?.course?.total_students || 0} students enrolled
                    </span>
                  </div>
                )}
              </div>

              <p className="text-lg md:text-xl text-[#D1D5DB] leading-relaxed mb-4 md:mb-6">
                {course.short_description || course.description || overview?.course?.short_description || overview?.course?.description || 'Introduction to data science with Python. Learn pandas, numpy, and matplotlib.'}
              </p>
            </motion.div>

            {/* What you'll learn */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] border-2 border-[#334155] rounded-3xl p-6 md:p-8 lg:p-10 shadow-xl shadow-black/20 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#10B981]/5 via-transparent to-[#3B82F6]/5"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center shadow-lg shadow-[#10B981]/30">
                    <Check className="text-white w-5 h-5" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black text-white">What you'll learn</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                  {(overview?.learning_objectives || [
                    'Complete course content',
                    'Certificate of completion',
                    'Quizzes and assignments',
                    'Lifetime access',
                  ]).map((item: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-3 p-3 md:p-4 bg-[#0F172A]/30 rounded-xl border border-[#334155]/50 hover:border-[#10B981]/50 transition-colors">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-md shadow-[#10B981]/30">
                        <Check className="text-white w-4 h-4" />
                      </div>
                      <span className="text-[#D1D5DB] text-base font-medium leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Course Content Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] border-2 border-[#334155] rounded-3xl p-6 md:p-8 lg:p-10 shadow-xl shadow-black/20 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#3B82F6]/5 via-transparent to-[#8B5CF6]/5"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] flex items-center justify-center shadow-lg shadow-[#3B82F6]/30">
                    <Clock className="text-white w-5 h-5" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black text-white">Course Content</h2>
                </div>
                <div className="flex items-center gap-4 md:gap-6 lg:gap-8 flex-wrap">
                  <div className="flex items-center gap-3 bg-[#0F172A]/50 backdrop-blur-sm border border-[#334155] rounded-xl px-5 md:px-6 py-4 md:py-5 hover:border-[#10B981]/50 transition-colors flex-1 min-w-[140px]">
                    <span className="text-3xl md:text-4xl font-black text-white">
                      {overview?.stats?.total_sections ?? course?.total_sections ?? course?.sections?.length ?? 0}
                    </span>
                    <span className="text-sm md:text-base text-[#9CA3AF] font-medium ml-2">sections</span>
                  </div>
                  <div className="flex items-center gap-3 bg-[#0F172A]/50 backdrop-blur-sm border border-[#334155] rounded-xl px-5 md:px-6 py-4 md:py-5 hover:border-[#10B981]/50 transition-colors flex-1 min-w-[140px]">
                    <span className="text-3xl md:text-4xl font-black text-white">
                      {overview?.stats?.total_lectures ?? course?.total_lectures ?? 0}
                    </span>
                    <span className="text-sm md:text-base text-[#9CA3AF] font-medium ml-2">lectures</span>
                  </div>
                  <div className="flex items-center gap-3 bg-[#0F172A]/50 backdrop-blur-sm border border-[#334155] rounded-xl px-5 md:px-6 py-4 md:py-5 hover:border-[#10B981]/50 transition-colors flex-1 min-w-[140px]">
                    <span className="text-3xl md:text-4xl font-black text-white">
                      {overview?.stats?.total_duration_hours ?? course?.total_duration_hours ?? 0}h
                    </span>
                    <span className="text-sm md:text-base text-[#9CA3AF] font-medium ml-2">total length</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Course Content Preview - Like Udemy */}
            {overview?.content_preview && overview.content_preview.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] border-2 border-[#334155] rounded-3xl p-6 md:p-8 lg:p-10 shadow-xl shadow-black/20 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#10B981]/5 via-transparent to-[#3B82F6]/5"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center shadow-lg shadow-[#10B981]/30">
                      <Play className="text-white w-5 h-5" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black text-white">Course Curriculum</h2>
                  </div>
                  
                  <div className="space-y-4">
                    {overview.content_preview.map((section: any, sectionIdx: number) => (
                      <div key={section.id} className="border border-[#334155] rounded-xl overflow-hidden bg-[#0F172A]/30">
                        <div className="px-4 py-4 bg-[#1E293B]/50 border-b border-[#334155] flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-[#9CA3AF]">Section {section.order}:</span>
                            <h3 className="text-lg font-bold text-white">{section.title}</h3>
                            {section.is_preview && (
                              <span className="px-2 py-1 text-xs font-semibold bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30 rounded">
                                Preview
                              </span>
                            )}
                          </div>
                          <span className="text-sm text-[#9CA3AF]">{section.total_lectures} lectures</span>
                        </div>
                        <div className="divide-y divide-[#334155]">
                          {section.lectures.slice(0, isEnrolled ? section.lectures.length : 2).map((lecture: any, lectureIdx: number) => (
                            <div key={lecture.id} className="px-4 py-3 flex items-center justify-between hover:bg-[#1E293B]/30 transition-colors">
                              <div className="flex items-center gap-3 flex-1">
                                <Play className="w-4 h-4 text-[#10B981] flex-shrink-0" />
                                <span className="text-sm text-[#D1D5DB]">{lecture.title}</span>
                                {lecture.is_preview && (
                                  <span className="px-2 py-0.5 text-xs font-medium bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30 rounded">
                                    Preview
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-[#9CA3AF] ml-4">{lecture.duration_minutes}m</span>
                            </div>
                          ))}
                          {!isEnrolled && section.lectures.length > 2 && (
                            <div className="px-4 py-3 text-sm text-[#9CA3AF] italic">
                              +{section.lectures.length - 2} more lectures (enroll to view all)
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {!isEnrolled && (
                    <div className="mt-6 p-4 bg-[#10B981]/10 border border-[#10B981]/30 rounded-xl">
                      <p className="text-sm text-[#D1D5DB]">
                        <span className="font-semibold text-[#10B981]">Preview available:</span> You can preview the first 1-2 lectures of each section. Enroll to access all course content, quizzes, and assignments.
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar - Pricing Card */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="sticky top-24 bg-gradient-to-br from-[#1E293B] to-[#0F172A] border-2 border-[#334155] rounded-3xl p-6 md:p-8 lg:p-10 shadow-2xl shadow-black/30 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#10B981]/5 via-transparent to-[#3B82F6]/5"></div>
              
              <div className="relative z-10">
                <div className="mb-8">
                  <div className="text-5xl md:text-6xl font-black text-white mb-2 bg-gradient-to-r from-white to-[#10B981] bg-clip-text text-transparent">
                    {formatPrice(course.price)}
                  </div>
                  <div className="text-sm text-[#9CA3AF] font-medium">One-time payment</div>
                </div>

                <div className="space-y-4 mb-8">
                  {isEnrolled ? (
                    <Link href={`/learn/${course.slug}`}>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#10B981] text-white py-4 rounded-xl font-black text-lg transition-all duration-300 shadow-xl shadow-[#10B981]/30 hover:shadow-[#10B981]/50 flex items-center justify-center gap-2"
                      >
                        <Play className="w-5 h-5" />
                        Go to Course
                      </motion.button>
                    </Link>
                  ) : (
                    <>
                      <motion.button
                        onClick={handleEnroll}
                        disabled={enrolling}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#10B981] text-white py-4 rounded-xl font-black text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-[#10B981]/30 hover:shadow-[#10B981]/50 flex items-center justify-center gap-2"
                      >
                        <Play className="w-5 h-5" />
                        {enrolling ? 'Enrolling...' : 'Enroll Now'}
                      </motion.button>
                      <motion.button
                        onClick={handleAddToCart}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full border-2 border-[#334155] bg-[#0F172A]/50 backdrop-blur-sm text-white py-4 rounded-xl font-bold hover:border-[#10B981] hover:bg-[#10B981]/10 transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <ShoppingCart className="w-5 h-5" />
                        Add to Cart
                      </motion.button>
                    </>
                  )}
                </div>

                <div className="border-t border-[#334155] pt-6 space-y-4">
                  <div className="flex items-center gap-3 bg-[#0F172A]/30 backdrop-blur-sm border border-[#334155] rounded-xl px-4 py-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10B981]/20 to-[#059669]/20 flex items-center justify-center flex-shrink-0 border border-[#10B981]/30">
                      <Star className="text-[#10B981] w-5 h-5" />
                    </div>
                    <span className="text-[#D1D5DB] text-sm font-medium">
                      {course.average_rating ? `${course.average_rating.toFixed(1)} rating` : overview?.course?.rating ? `${overview.course.rating.toFixed(1)} rating` : 'No ratings yet'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 bg-[#0F172A]/30 backdrop-blur-sm border border-[#334155] rounded-xl px-4 py-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10B981]/20 to-[#059669]/20 flex items-center justify-center flex-shrink-0 border border-[#10B981]/30">
                      <Users className="text-[#10B981] w-5 h-5" />
                    </div>
                    <span className="text-[#D1D5DB] text-sm font-medium">
                      {course.enrolled_count || overview?.course?.total_students || 0} students
                    </span>
                  </div>
                  <div className="flex items-center gap-3 bg-[#0F172A]/30 backdrop-blur-sm border border-[#334155] rounded-xl px-4 py-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10B981]/20 to-[#059669]/20 flex items-center justify-center flex-shrink-0 border border-[#10B981]/30">
                      <Clock className="text-[#10B981] w-5 h-5" />
                    </div>
                    <span className="text-[#D1D5DB] text-sm font-medium">
                      {overview?.stats?.total_duration_hours || course?.total_duration_hours || 0} hours
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
