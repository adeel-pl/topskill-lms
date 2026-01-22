'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { enrollmentsAPI, cartAPI } from '@/lib/api';
import { BookOpen, ShoppingCart, Play, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { colors } from '@/lib/colors';
import { FiClock, FiZap, FiPlay } from 'react-icons/fi';

interface Enrollment {
  id: number;
  course: {
    id: number;
    title: string;
    slug: string;
    modality?: string;
    thumbnail?: string;
    price: number;
  };
  batch?: {
    id: number;
    name: string;
  };
  status: string;
  progress_percent: number | string | null;
  created_at: string;
}

interface CartItem {
  id: number;
  course: {
    id: number;
    title: string;
    slug: string;
    thumbnail?: string;
    price: number;
  };
}

export default function PurchaseHistoryPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, isLoading]);

  const loadData = async () => {
    const currentRequestId = ++requestIdRef.current;
    try {
      // Load enrollments
      const enrollmentsRes = await enrollmentsAPI.getAll();
      const enrollmentsData = enrollmentsRes.data.results || enrollmentsRes.data || [];
      
      // Load cart items
      let cartData: CartItem[] = [];
      try {
        const cartRes = await cartAPI.get();
        cartData = cartRes.data.items || [];
      } catch (error) {
        console.error('Error loading cart:', error);
      }

      // Only update state if this is still the latest request (prevents race conditions)
      if (currentRequestId === requestIdRef.current) {
        setEnrollments(enrollmentsData);
        setCartItems(cartData);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      // Only update state if this is still the latest request
      if (currentRequestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  };

  const formatPrice = (price: number) => {
    if (typeof price !== 'number' || isNaN(price)) {
      return '$0';
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const calculateTotalValue = () => {
    const enrolledValue = enrollments.reduce((sum, e) => {
      const price = e.course?.price;
      return sum + (typeof price === 'number' && !isNaN(price) ? price : 0);
    }, 0);
    const cartValue = cartItems.reduce((sum, item) => {
      const price = item.course?.price;
      return sum + (typeof price === 'number' && !isNaN(price) ? price : 0);
    }, 0);
    return enrolledValue + cartValue;
  };

  const calculateAverageProgress = () => {
    if (enrollments.length === 0) return 0;
    const totalProgress = enrollments.reduce((sum, e) => {
      const progress = e.progress_percent;
      const numProgress = typeof progress === 'number' ? progress : parseFloat(String(progress || 0));
      return sum + (isNaN(numProgress) ? 0 : Math.max(0, Math.min(100, numProgress)));
    }, 0);
    return Math.round(totalProgress / enrollments.length);
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background.primary }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 rounded-full animate-spin mx-auto mb-4" style={{ borderColor: colors.border.primary, borderTopColor: colors.accent.primary }}></div>
          <p style={{ color: colors.text.muted }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 pb-8 md:pb-12" style={{ backgroundColor: colors.background.primary, color: colors.text.dark }}>
      <div className="max-w-container xl:max-w-container-xl 2xl:max-w-container-2xl mx-auto w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 pb-10 md:pb-12">
        <div className="mb-8 md:mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-2" style={{ color: colors.text.dark }}>
            Purchase History
          </h1>
          <p className="text-base md:text-lg" style={{ color: colors.text.muted }}>View all your enrolled courses and cart items</p>
        </div>

        {/* Analytics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="rounded-2xl p-6" style={{ backgroundColor: colors.background.card, borderColor: colors.border.primary, borderWidth: '1px', borderStyle: 'solid' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium" style={{ color: colors.text.muted }}>Total Enrolled</span>
              <BookOpen className="w-5 h-5" style={{ color: colors.accent.primary }} />
            </div>
            <p className="text-3xl font-black" style={{ color: colors.text.dark }}>{enrollments.length}</p>
            <p className="text-xs mt-1" style={{ color: colors.text.muted }}>Active courses</p>
          </div>
          <div className="rounded-2xl p-6" style={{ backgroundColor: colors.background.card, borderColor: colors.border.primary, borderWidth: '1px', borderStyle: 'solid' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium" style={{ color: colors.text.muted }}>Average Progress</span>
              <Play className="w-5 h-5" style={{ color: colors.accent.primary }} />
            </div>
            <p className="text-3xl font-black" style={{ color: colors.text.dark }}>{calculateAverageProgress()}%</p>
            <p className="text-xs mt-1" style={{ color: colors.text.muted }}>Across all courses</p>
          </div>
        </div>

        {/* Enrolled Courses */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="w-6 h-6" style={{ color: colors.accent.primary }} />
            <h2 className="text-2xl md:text-3xl font-black" style={{ color: colors.text.dark }}>Enrolled Courses ({enrollments.length})</h2>
          </div>

          {enrollments.length === 0 ? (
            <div className="rounded-2xl p-12 text-center" style={{ backgroundColor: colors.background.card, borderColor: colors.border.primary, borderWidth: '1px', borderStyle: 'solid' }}>
              <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" style={{ color: colors.accent.primary }} />
              <p className="mb-4 text-lg" style={{ color: colors.text.muted }}>No enrolled courses yet</p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold hover:scale-105 transition-all"
                style={{ backgroundColor: colors.button.primary, color: colors.text.white }}
              >
                Browse Courses
              </Link>
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
                        {enrollment.course.modality && (
                          <span className="px-2.5 md:px-3 lg:px-4 py-1 md:py-1.5 lg:py-2 rounded-xl text-xs font-black text-white" style={{ backgroundColor: colors.accent.blue }}>
                            {enrollment.course.modality.toUpperCase()}
                          </span>
                        )}
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

        {/* Cart Items */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <ShoppingCart className="w-6 h-6" style={{ color: colors.accent.primary }} />
            <h2 className="text-2xl md:text-3xl font-black" style={{ color: colors.text.dark }}>Cart Items ({cartItems.length})</h2>
          </div>

          {cartItems.length === 0 ? (
            <div className="rounded-2xl p-12 text-center" style={{ backgroundColor: colors.background.card, borderColor: colors.border.primary, borderWidth: '1px', borderStyle: 'solid' }}>
              <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-50" style={{ color: colors.accent.primary }} />
              <p className="mb-4 text-lg" style={{ color: colors.text.muted }}>Your cart is empty</p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold hover:scale-105 transition-all"
                style={{ backgroundColor: colors.button.primary, color: colors.text.white }}
              >
                Browse Courses
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cartItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="rounded-2xl overflow-hidden transition-all hover:shadow-xl"
                  style={{ backgroundColor: colors.background.card, borderColor: colors.border.primary, borderWidth: '1px', borderStyle: 'solid' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = colors.accent.primary;
                    e.currentTarget.style.boxShadow = `0 20px 25px -5px ${colors.accent.primary}20`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = colors.border.primary;
                    e.currentTarget.style.boxShadow = '';
                  }}
                >
                  <Link href={`/courses/${item.course.slug}`}>
                    <div className="relative aspect-video" style={{ backgroundColor: colors.accent.primary }}>
                      {item.course.thumbnail ? (
                        <img
                          src={item.course.thumbnail}
                          alt={item.course.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-white text-4xl font-black">
                            {item.course.title.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    </div>
                  </Link>
                  
                  <div className="p-6">
                    <Link href={`/courses/${item.course.slug}`}>
                      <h3 className="text-xl font-bold mb-3 transition-colors line-clamp-2" style={{ color: colors.text.dark }}
                        onMouseEnter={(e) => e.currentTarget.style.color = colors.accent.primary}
                        onMouseLeave={(e) => e.currentTarget.style.color = colors.text.dark}>
                        {item.course.title}
                      </h3>
                    </Link>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-black" style={{ color: colors.text.dark }}>
                        {formatPrice(item.course.price || 0)}
                      </div>
                      <Link
                        href="/cart"
                        className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all"
                        style={{ backgroundColor: colors.button.primary, color: colors.text.white }}
                      >
                        <ShoppingCart className="w-4 h-4" />
                        View Cart
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
