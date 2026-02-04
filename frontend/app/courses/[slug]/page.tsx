'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { coursesAPI, cartAPI, playerAPI, wishlistAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import PureLogicsNavbar from '@/app/components/PureLogicsNavbar';
import { Star, Users, Clock, Check, ShoppingCart, Play, User, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/app/contexts/ToastContext';
import { colors } from '@/lib/colors';

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { showSuccess, showError, showInfo } = useToast();
  const [course, setCourse] = useState<any>(null);
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistId, setWishlistId] = useState<number | null>(null);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  useEffect(() => {
    loadCourse();
  }, [params.slug]);

  useEffect(() => {
    if (isAuthenticated && course) {
      checkWishlist();
      checkCartAndEnrollment();
    }
  }, [isAuthenticated, course]);

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
        router.push('/');
        return;
      }

      setCourse(courseData);

      try {
        // Overview API is public (AllowAny), so it works for non-logged-in users
        const overviewRes = await playerAPI.getOverview(courseData.id);
        setOverview(overviewRes.data);
        // Don't set enrollment status here - check separately for logged-in users
      } catch (error) {
        console.error('Error loading overview:', error);
        // Fallback to course data if overview fails - use actual course data
        // This ensures curriculum is shown even if API fails
        setOverview({
          course: courseData,
          stats: {
            total_sections: courseData.total_sections || courseData.sections?.length || 0,
            total_lectures: courseData.total_lectures || 0,
            total_duration_hours: courseData.total_duration_hours || 0,
          },
          content_preview: courseData.sections?.map((section: any) => ({
            id: section.id,
            title: section.title,
            order: section.order,
            is_preview: section.is_preview || false,
            lectures: section.lectures?.map((lecture: any) => ({
              id: lecture.id,
              title: lecture.title,
              duration_minutes: lecture.duration_minutes || 0,
              is_preview: lecture.is_preview || false,
              order: lecture.order,
            })) || [],
            total_lectures: section.lectures?.length || 0,
          })) || [],
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
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading course:', error);
      setLoading(false);
    }
  };

  const checkCartAndEnrollment = async () => {
    if (!isAuthenticated || !course) return;
    
    try {
      // Check enrollment status only - enrollment happens after checkout, not just adding to cart
      const overviewRes = await playerAPI.getOverview(course.id);
      setIsEnrolled(overviewRes.data?.enrollment?.enrolled || false);
      
      // Check cart status (for display purposes only, doesn't affect access)
      const cartRes = await cartAPI.get();
      const cartData = Array.isArray(cartRes.data) ? cartRes.data[0] : cartRes.data;
      const cartItems = cartData?.items || [];
      const courseInCart = cartItems.some((item: any) => item.course?.id === course.id || item.course_id === course.id);
      setIsInCart(courseInCart);
    } catch (error) {
      console.error('Error checking cart/enrollment:', error);
      setIsEnrolled(false);
      setIsInCart(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    try {
      await cartAPI.addItem(course.id);
      setIsInCart(true);
      showSuccess('Course added to cart!');
      setTimeout(() => {
        router.push('/cart');
      }, 1000);
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Failed to add to cart';
      if (errorMsg.includes('already in cart')) {
        setIsInCart(true);
        showInfo('Course is already in your cart');
        setTimeout(() => {
          router.push('/cart');
        }, 1000);
      } else {
        showError(errorMsg);
      }
    }
  };

  const checkWishlist = async () => {
    if (!isAuthenticated || !course) return;
    
    try {
      const response = await wishlistAPI.getAll();
      const wishlist = response.data.results || response.data || [];
      const wishlistItem = wishlist.find((item: any) => item.course?.id === course.id);
      if (wishlistItem) {
        setIsInWishlist(true);
        setWishlistId(wishlistItem.id);
      }
    } catch (error) {
      console.error('Error checking wishlist:', error);
    }
  };

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    setWishlistLoading(true);
    try {
      if (isInWishlist && wishlistId) {
        await wishlistAPI.remove(wishlistId);
        setIsInWishlist(false);
        setWishlistId(null);
        showSuccess('Removed from wishlist');
      } else {
        await wishlistAPI.add(course.id);
        await checkWishlist();
        showSuccess('Added to wishlist');
      }
    } catch (error: any) {
      showError(error.response?.data?.error || 'Failed to update wishlist');
    } finally {
      setWishlistLoading(false);
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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background.primary }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 rounded-full animate-spin mx-auto mb-4" style={{ borderColor: colors.border.primary, borderTopColor: colors.accent.primary }}></div>
          <p style={{ color: colors.text.muted }}>Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background.primary }}>
        <div className="text-center">
          <h2 className="text-3xl font-black mb-4" style={{ color: colors.text.dark }}>Course not found</h2>
          <Link href="/" className="hover:underline font-semibold" style={{ color: colors.accent.primary }}>Browse Courses</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background.primary, color: colors.text.dark }}>
      <PureLogicsNavbar />

      <div className="section-after-header max-w-[1400px] xl:max-w-[1600px] 2xl:max-w-[1800px] mx-auto w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 pb-12 relative z-10">
        {/* Course Thumbnail */}
        {course.thumbnail && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10 rounded-3xl overflow-hidden shadow-2xl"
            style={{ borderColor: colors.border.primary, borderWidth: '2px', borderStyle: 'solid' }}
          >
            <div className="relative w-full h-80 lg:h-96" style={{ backgroundColor: colors.accent.primary }}>
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-full object-cover"
              />
              {course.modality && (
                <div className="absolute top-6 right-6">
                  <span 
                    className="px-4 py-2 rounded-xl text-sm font-black backdrop-blur-md border-2 shadow-xl text-white"
                    style={{
                      backgroundColor: course.modality === 'online' 
                        ? colors.accent.primary 
                        : course.modality === 'hybrid'
                        ? colors.accent.secondary
                        : colors.accent.secondary,
                      borderColor: course.modality === 'online' 
                        ? colors.accent.primary 
                        : course.modality === 'hybrid'
                        ? colors.accent.secondary
                        : colors.accent.secondary
                    }}
                  >
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
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 leading-tight" style={{ color: colors.text.dark }}>
                {course.title}
              </h1>
              
              {/* Instructor and Rating Info */}
              <div className="flex items-center gap-4 md:gap-6 mb-6 md:mb-8 flex-wrap">
                {(course.instructor_name || overview?.course?.instructor?.name) && (
                  <div className="flex items-center gap-3 rounded-xl px-4 md:px-5 py-3 md:py-3.5 transition-colors" style={{ backgroundColor: colors.background.secondary, borderColor: colors.border.primary, borderWidth: '1px', borderStyle: 'solid' }}>
                    <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: colors.accent.primary }}>
                      <User className="text-white w-5 h-5" />
                    </div>
                    <div className="ml-2">
                      <p className="text-xs font-medium mb-1" style={{ color: colors.text.muted }}>Instructor</p>
                      <p className="text-base font-bold" style={{ color: colors.text.dark }}>
                        {course.instructor_name || overview?.course?.instructor?.name || 'John Instructor'}
                      </p>
                    </div>
                  </div>
                )}
                {course.average_rating && course.average_rating > 0 && (
                  <div className="flex items-center gap-2 rounded-xl px-4 md:px-5 py-3 md:py-3.5 transition-colors" style={{ backgroundColor: colors.background.secondary, borderColor: colors.border.primary, borderWidth: '1px', borderStyle: 'solid' }}>
                    <div className="flex items-center gap-1.5">
                      <Star className="w-5 h-5" style={{ color: colors.accent.primary, fill: colors.accent.primary }} />
                      <span className="text-xl font-black" style={{ color: colors.text.dark }}>{course.average_rating.toFixed(1)}</span>
                    </div>
                    {course.rating_count && (
                      <span className="text-sm ml-2" style={{ color: colors.text.muted }}>
                        ({course.rating_count > 1000 ? `${(course.rating_count / 1000).toFixed(1)}K` : course.rating_count} ratings)
                      </span>
                    )}
                  </div>
                )}
                {((course.enrolled_count || overview?.course?.total_students || 0) > 0) && (
                  <div className="flex items-center gap-2 rounded-xl px-4 md:px-5 py-3 md:py-3.5 transition-colors" style={{ backgroundColor: colors.background.secondary, borderColor: colors.border.primary, borderWidth: '1px', borderStyle: 'solid', color: colors.text.muted }}>
                    <Users className="w-5 h-5" />
                    <span className="text-sm font-medium ml-1">
                      {course.enrolled_count || overview?.course?.total_students || 0} students enrolled
                    </span>
                  </div>
                )}
              </div>

              <p className="text-lg md:text-xl leading-relaxed mb-4 md:mb-6" style={{ color: colors.text.muted }}>
                {course.short_description || course.description || overview?.course?.short_description || overview?.course?.description || 'Introduction to data science with Python. Learn pandas, numpy, and matplotlib.'}
              </p>
            </motion.div>

            {/* What you'll learn */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="rounded-3xl p-6 md:p-8 lg:p-10 shadow-xl relative overflow-hidden"
              style={{ backgroundColor: colors.background.secondary, borderColor: colors.border.primary, borderWidth: '2px', borderStyle: 'solid' }}
            >
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: colors.accent.primary }}>
                    <Check className="text-white w-5 h-5" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black" style={{ color: colors.text.dark }}>What you'll learn</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                  {(overview?.learning_objectives || [
                    'Complete course content',
                    'Certificate of completion',
                    'Quizzes and assignments',
                    'Lifetime access',
                  ]).map((item: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-3 p-3 md:p-4 rounded-xl transition-colors" style={{ backgroundColor: colors.background.primary, borderColor: colors.border.primary, borderWidth: '1px', borderStyle: 'solid' }}>
                      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: colors.accent.primary }}>
                        <Check className="text-white w-4 h-4" />
                      </div>
                      <span className="text-base font-medium leading-relaxed" style={{ color: colors.text.dark }}>{item}</span>
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
              className="rounded-3xl p-6 md:p-8 lg:p-10 shadow-xl relative overflow-hidden"
              style={{ backgroundColor: colors.background.secondary, borderColor: colors.border.primary, borderWidth: '2px', borderStyle: 'solid' }}
            >
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: colors.accent.primary }}>
                    <Clock className="text-white w-5 h-5" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black" style={{ color: colors.text.dark }}>Course Content</h2>
                </div>
                <div className="flex items-center gap-4 md:gap-6 lg:gap-8 flex-wrap">
                  <div className="flex items-center gap-3 rounded-xl px-5 md:px-6 py-4 md:py-5 transition-colors flex-1 min-w-[140px]" style={{ backgroundColor: colors.background.primary, borderColor: colors.border.primary, borderWidth: '1px', borderStyle: 'solid' }}>
                    <span className="text-3xl md:text-4xl font-black" style={{ color: colors.text.dark }}>
                      {overview?.stats?.total_sections ?? course?.total_sections ?? course?.sections?.length ?? 0}
                    </span>
                    <span className="text-sm md:text-base font-medium ml-2" style={{ color: colors.text.muted }}>sections</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl px-5 md:px-6 py-4 md:py-5 transition-colors flex-1 min-w-[140px]" style={{ backgroundColor: colors.background.primary, borderColor: colors.border.primary, borderWidth: '1px', borderStyle: 'solid' }}>
                    <span className="text-3xl md:text-4xl font-black" style={{ color: colors.text.dark }}>
                      {overview?.stats?.total_lectures ?? course?.total_lectures ?? 0}
                    </span>
                    <span className="text-sm md:text-base font-medium ml-2" style={{ color: colors.text.muted }}>lectures</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl px-5 md:px-6 py-4 md:py-5 transition-colors flex-1 min-w-[140px]" style={{ backgroundColor: colors.background.primary, borderColor: colors.border.primary, borderWidth: '1px', borderStyle: 'solid' }}>
                    <span className="text-3xl md:text-4xl font-black" style={{ color: colors.text.dark }}>
                      {overview?.stats?.total_duration_hours ?? course?.total_duration_hours ?? 0}h
                    </span>
                    <span className="text-sm md:text-base font-medium ml-2" style={{ color: colors.text.muted }}>total length</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Course Content Preview - Like Udemy */}
            {(overview?.content_preview && overview.content_preview.length > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="rounded-3xl p-6 md:p-8 lg:p-10 shadow-xl relative overflow-hidden"
                style={{ backgroundColor: colors.background.secondary, borderColor: colors.border.primary, borderWidth: '2px', borderStyle: 'solid' }}
              >
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: colors.accent.primary }}>
                      <Play className="text-white w-5 h-5" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black" style={{ color: colors.text.dark }}>Course Curriculum</h2>
                  </div>
                  
                  <div className="space-y-4">
                    {overview.content_preview.map((section: any, sectionIdx: number) => (
                      <div key={section.id} className="rounded-xl overflow-hidden" style={{ backgroundColor: colors.background.primary, borderColor: colors.border.primary, borderWidth: '1px', borderStyle: 'solid' }}>
                        <div className="px-4 py-4 flex items-center justify-between" style={{ backgroundColor: colors.background.secondary, borderBottomColor: colors.border.primary, borderBottomWidth: '1px', borderBottomStyle: 'solid' }}>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold" style={{ color: colors.text.muted }}>Section {section.order}:</span>
                            <h3 className="text-lg font-bold" style={{ color: colors.text.dark }}>{section.title}</h3>
                            {section.is_preview && (
                              <span className="px-2 py-1 text-xs font-semibold rounded" style={{ backgroundColor: `${colors.accent.primary}20`, color: colors.accent.primary, borderColor: `${colors.accent.primary}30`, borderWidth: '1px', borderStyle: 'solid' }}>
                                Preview
                              </span>
                            )}
                          </div>
                          <span className="text-sm" style={{ color: colors.text.muted }}>{section.total_lectures} lectures</span>
                        </div>
                        <div style={{ borderTopColor: colors.border.primary, borderTopWidth: '1px', borderTopStyle: 'solid' }}>
                          {section.lectures.map((lecture: any, lectureIdx: number) => {
                            // Preview lectures work for everyone (logged in or not)
                            // Full lectures only work if enrolled (after checkout), not just in cart
                            const isPreviewLecture = lecture.is_preview;
                            const hasFullAccess = isEnrolled; // Only check enrollment, not cart
                            const canAccess = isPreviewLecture || hasFullAccess;
                            
                            return (
                              <div 
                                key={lecture.id} 
                                className={`px-4 py-3 flex items-center justify-between transition-colors ${
                                  canAccess ? 'cursor-pointer hover:opacity-80' : 'opacity-60'
                                }`}
                                style={canAccess ? { backgroundColor: colors.background.secondary } : {}}
                                onClick={() => {
                                  if (canAccess) {
                                    router.push(`/learn/${course.slug}?lecture=${lecture.id}`);
                                  } else {
                                    showInfo('Please complete checkout to access this lecture');
                                  }
                                }}
                              >
                                <div className="flex items-center gap-3 flex-1">
                                  <Play className={`w-4 h-4 flex-shrink-0`} style={{ color: canAccess ? colors.accent.primary : colors.text.muted }} />
                                  <span className={`text-sm`} style={{ color: canAccess ? colors.text.dark : colors.text.muted }}>{lecture.title}</span>
                                  {isPreviewLecture && (
                                    <span className="px-2 py-0.5 text-xs font-medium rounded" style={{ backgroundColor: `${colors.accent.primary}20`, color: colors.accent.primary, borderColor: `${colors.accent.primary}30`, borderWidth: '1px', borderStyle: 'solid' }}>
                                      Preview
                                    </span>
                                  )}
                                </div>
                                <span className={`text-xs ml-4`} style={{ color: canAccess ? colors.text.muted : colors.text.muted }}>{lecture.duration_minutes}m</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
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
              className="sticky top-24 rounded-3xl p-6 md:p-8 lg:p-10 shadow-2xl relative overflow-hidden"
              style={{ backgroundColor: colors.background.secondary, borderColor: colors.border.primary, borderWidth: '2px', borderStyle: 'solid' }}
            >
              <div className="relative z-10">
                <div className="mb-8">
                  <div className="text-5xl md:text-6xl font-black mb-2" style={{ color: colors.accent.primary }}>
                    {formatPrice(course.price)}
                  </div>
                  <div className="text-sm font-medium" style={{ color: colors.text.muted }}>One-time payment</div>
                </div>

                <div className="space-y-4 mb-8">
                  {isEnrolled ? (
                    <Link href={`/learn/${course.slug}`}>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-4 rounded-xl font-black text-lg transition-all duration-300 flex items-center justify-center gap-2"
                        style={{ backgroundColor: colors.button.primary, color: colors.text.white }}
                      >
                        <Play className="w-5 h-5" />
                        Go to Course
                      </motion.button>
                    </Link>
                  ) : (
                    <>
                      <motion.button
                        onClick={handleAddToCart}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-4 rounded-xl font-black text-lg transition-all duration-300 flex items-center justify-center gap-2"
                        style={{ backgroundColor: colors.button.primary, color: colors.text.white }}
                      >
                        <ShoppingCart className="w-5 h-5" />
                        Add to Cart
                      </motion.button>
                      {isAuthenticated && (
                        <motion.button
                          onClick={handleToggleWishlist}
                          disabled={wishlistLoading}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full py-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{ 
                            borderColor: isInWishlist ? colors.status.error : colors.border.primary, 
                            borderWidth: '2px', 
                            borderStyle: 'solid',
                            backgroundColor: isInWishlist ? colors.status.error : colors.background.primary,
                            color: isInWishlist ? colors.text.white : colors.text.dark
                          }}
                        >
                          <Heart className="w-5 h-5" style={{ color: isInWishlist ? colors.status.error : colors.text.dark, fill: isInWishlist ? colors.status.error : 'none' }} />
                          {wishlistLoading ? 'Loading...' : isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                        </motion.button>
                      )}
                    </>
                  )}
                </div>

                <div className="pt-6 space-y-4" style={{ borderTopColor: colors.border.primary, borderTopWidth: '1px', borderTopStyle: 'solid' }}>
                  <div className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ backgroundColor: colors.background.primary, borderColor: colors.border.primary, borderWidth: '1px', borderStyle: 'solid' }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${colors.accent.primary}20`, borderColor: `${colors.accent.primary}30`, borderWidth: '1px', borderStyle: 'solid' }}>
                      <Star className="w-5 h-5" style={{ color: colors.accent.primary }} />
                    </div>
                    <span className="text-sm font-medium" style={{ color: colors.text.dark }}>
                      {course.average_rating ? `${course.average_rating.toFixed(1)} rating` : overview?.course?.rating ? `${overview.course.rating.toFixed(1)} rating` : 'No ratings yet'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ backgroundColor: colors.background.primary, borderColor: colors.border.primary, borderWidth: '1px', borderStyle: 'solid' }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${colors.accent.primary}20`, borderColor: `${colors.accent.primary}30`, borderWidth: '1px', borderStyle: 'solid' }}>
                      <Users className="w-5 h-5" style={{ color: colors.accent.primary }} />
                    </div>
                    <span className="text-sm font-medium" style={{ color: colors.text.dark }}>
                      {course.enrolled_count || overview?.course?.total_students || 0} students
                    </span>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ backgroundColor: colors.background.primary, borderColor: colors.border.primary, borderWidth: '1px', borderStyle: 'solid' }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${colors.accent.primary}20`, borderColor: `${colors.accent.primary}30`, borderWidth: '1px', borderStyle: 'solid' }}>
                      <Clock className="w-5 h-5" style={{ color: colors.accent.primary }} />
                    </div>
                    <span className="text-sm font-medium" style={{ color: colors.text.dark }}>
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
