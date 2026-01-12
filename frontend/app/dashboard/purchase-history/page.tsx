'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { enrollmentsAPI, cartAPI } from '@/lib/api';
import { BookOpen, ShoppingCart, Play, Clock, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface Enrollment {
  id: number;
  course: {
    id: number;
    title: string;
    slug: string;
    thumbnail?: string;
    price: number;
  };
  status: string;
  progress_percent: number;
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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const calculateTotalValue = () => {
    const enrolledValue = enrollments.reduce((sum, e) => sum + (e.course.price || 0), 0);
    const cartValue = cartItems.reduce((sum, item) => sum + (item.course.price || 0), 0);
    return enrolledValue + cartValue;
  };

  const calculateAverageProgress = () => {
    if (enrollments.length === 0) return 0;
    const totalProgress = enrollments.reduce((sum, e) => sum + (e.progress_percent || 0), 0);
    return Math.round(totalProgress / enrollments.length);
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#334155] border-t-[#10B981] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#9CA3AF]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 md:py-12 text-white">
      <div className="max-w-container xl:max-w-container-xl 2xl:max-w-container-2xl mx-auto w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 py-10 md:py-12">
        <div className="mb-8 md:mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-2 text-white">
            Purchase History
          </h1>
          <p className="text-[#9CA3AF] text-base md:text-lg">View all your enrolled courses and cart items</p>
        </div>

        {/* Analytics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#1E293B] border border-[#334155] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#9CA3AF] text-sm font-medium">Total Enrolled</span>
              <BookOpen className="w-5 h-5 text-[#10B981]" />
            </div>
            <p className="text-3xl font-black text-white">{enrollments.length}</p>
            <p className="text-xs text-[#9CA3AF] mt-1">Active courses</p>
          </div>
          <div className="bg-[#1E293B] border border-[#334155] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#9CA3AF] text-sm font-medium">Total Value</span>
              <TrendingUp className="w-5 h-5 text-[#10B981]" />
            </div>
            <p className="text-3xl font-black text-[#10B981]">
              {formatPrice(calculateTotalValue())}
            </p>
            <p className="text-xs text-[#9CA3AF] mt-1">Enrolled + Cart</p>
          </div>
          <div className="bg-[#1E293B] border border-[#334155] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#9CA3AF] text-sm font-medium">Average Progress</span>
              <Play className="w-5 h-5 text-[#10B981]" />
            </div>
            <p className="text-3xl font-black text-white">{calculateAverageProgress()}%</p>
            <p className="text-xs text-[#9CA3AF] mt-1">Across all courses</p>
          </div>
        </div>

        {/* Enrolled Courses */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="w-6 h-6 text-[#10B981]" />
            <h2 className="text-2xl md:text-3xl font-black text-white">Enrolled Courses ({enrollments.length})</h2>
          </div>

          {enrollments.length === 0 ? (
            <div className="bg-[#1E293B] border border-[#334155] rounded-2xl p-12 text-center">
              <BookOpen className="w-16 h-16 text-[#10B981] mx-auto mb-4 opacity-50" />
              <p className="text-[#9CA3AF] mb-4 text-lg">No enrolled courses yet</p>
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 bg-[#10B981] hover:bg-[#10B981] text-white px-6 py-3 rounded-xl font-bold hover:scale-105 transition-all"
              >
                Browse Courses
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrollments.map((enrollment, index) => (
                <motion.div
                  key={enrollment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-[#1E293B] border border-[#334155] rounded-2xl overflow-hidden hover:border-[#10B981]/50 transition-all hover:shadow-xl hover:shadow-[#10B981]/20"
                >
                  <Link href={`/learn/${enrollment.course.slug}`}>
                    <div className="relative aspect-video bg-[#10B981]">
                      {enrollment.course.thumbnail ? (
                        <img
                          src={enrollment.course.thumbnail}
                          alt={enrollment.course.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-white text-4xl font-black">
                            {enrollment.course.title.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    </div>
                  </Link>
                  
                  <div className="p-6">
                    <Link href={`/learn/${enrollment.course.slug}`}>
                      <h3 className="text-xl font-bold text-white mb-3 hover:text-[#10B981] transition-colors line-clamp-2">
                        {enrollment.course.title}
                      </h3>
                    </Link>
                    
                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-[#9CA3AF] font-medium">Progress</span>
                        <span className="text-sm font-bold text-[#10B981]">
                          {Math.round(enrollment.progress_percent || 0)}%
                        </span>
                      </div>
                      <div className="w-full bg-[#0F172A] rounded-full h-2.5 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${enrollment.progress_percent || 0}%` }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className="h-full bg-[#10B981] rounded-full"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-[#9CA3AF]">
                        <Clock className="w-4 h-4" />
                        <span>Enrolled</span>
                      </div>
                      <Link
                        href={`/learn/${enrollment.course.slug}`}
                        className="flex items-center gap-2 bg-[#10B981] hover:bg-[#10B981] text-white px-4 py-2 rounded-lg font-bold text-sm hover:scale-105 transition-all"
                      >
                        <Play className="w-4 h-4" />
                        Continue
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Cart Items */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <ShoppingCart className="w-6 h-6 text-[#10B981]" />
            <h2 className="text-2xl md:text-3xl font-black text-white">Cart Items ({cartItems.length})</h2>
          </div>

          {cartItems.length === 0 ? (
            <div className="bg-[#1E293B] border border-[#334155] rounded-2xl p-12 text-center">
              <ShoppingCart className="w-16 h-16 text-[#10B981] mx-auto mb-4 opacity-50" />
              <p className="text-[#9CA3AF] mb-4 text-lg">Your cart is empty</p>
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 bg-[#10B981] hover:bg-[#10B981] text-white px-6 py-3 rounded-xl font-bold hover:scale-105 transition-all"
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
                  className="bg-[#1E293B] border border-[#334155] rounded-2xl overflow-hidden hover:border-[#10B981]/50 transition-all hover:shadow-xl hover:shadow-[#10B981]/20"
                >
                  <Link href={`/courses/${item.course.slug}`}>
                    <div className="relative aspect-video bg-[#10B981]">
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
                      <h3 className="text-xl font-bold text-white mb-3 hover:text-[#10B981] transition-colors line-clamp-2">
                        {item.course.title}
                      </h3>
                    </Link>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-black text-white">
                        {formatPrice(item.course.price)}
                      </div>
                      <Link
                        href="/cart"
                        className="flex items-center gap-2 bg-[#10B981] hover:bg-[#10B981] text-white px-4 py-2 rounded-lg font-bold text-sm transition-all"
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
