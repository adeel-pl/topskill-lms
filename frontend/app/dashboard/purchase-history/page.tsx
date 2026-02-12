'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { enrollmentsAPI, cartAPI } from '@/lib/api';
import { BookOpen, ShoppingCart, Play, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Container } from '@/app/components/ui/container';
import { Heading } from '@/app/components/ui/heading';
import { Text } from '@/app/components/ui/text';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { FiClock, FiZap, FiPlay } from 'react-icons/fi';
import { colors } from '@/lib/colors';

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
        
      }

      // Only update state if this is still the latest request (prevents race conditions)
      if (currentRequestId === requestIdRef.current) {
        setEnrollments(enrollmentsData);
        setCartItems(cartData);
        setLoading(false);
      }
    } catch (error) {
      
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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 rounded-full animate-spin mx-auto mb-4" style={{ borderColor: colors.border.primary, borderTopColor: colors.primary }}></div>
          <Text variant="muted">Loading...</Text>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-8 md:pb-12 bg-white">
      <Container size="2xl" className="pb-10 md:pb-12">
        <div className="mb-8 md:mb-12">
          <Heading as="h1" size="h1" className="mb-2">Purchase History</Heading>
          <Text variant="muted" size="lg">View all your enrolled courses and cart items</Text>
        </div>

        {/* Analytics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card variant="default" className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Text size="sm" variant="muted" className="font-medium">Total Enrolled</Text>
              <BookOpen className="w-5 h-5" style={{ color: colors.primary }} />
            </div>
            <Heading as="h2" size="h1" className="text-3xl">{enrollments.length}</Heading>
            <Text size="xs" variant="muted" className="mt-1">Active courses</Text>
          </Card>
          <Card variant="default" className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Text size="sm" variant="muted" className="font-medium">Average Progress</Text>
              <Play className="w-5 h-5" style={{ color: colors.primary }} />
            </div>
            <Heading as="h2" size="h1" className="text-3xl">{calculateAverageProgress()}%</Heading>
            <Text size="xs" variant="muted" className="mt-1">Across all courses</Text>
          </Card>
        </div>

        {/* Enrolled Courses */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="w-6 h-6" style={{ color: colors.primary }} />
            <Heading as="h2" size="h2">Enrolled Courses ({enrollments.length})</Heading>
          </div>

          {enrollments.length === 0 ? (
            <Card variant="default" className="p-12 text-center">
              <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" style={{ color: colors.primary }} />
              <Text size="lg" variant="muted" className="mb-4">No enrolled courses yet</Text>
              <Button asChild variant="default">
                <Link href="/">Browse Courses</Link>
              </Button>
            </Card>
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
                      {((enrollment.course as any).featured_image || enrollment.course.thumbnail) ? (
                        <img
                          src={(enrollment.course as any).featured_image || enrollment.course.thumbnail}
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
                          <span className="px-3 py-1 rounded-lg text-xs font-semibold text-white" style={{ backgroundColor: colors.accentColor }}>
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
                        <Button asChild variant="default" className="w-full" size="default">
                          <Link href={`/learn/${enrollment.course.slug}`}>
                            <FiPlay className="text-lg flex-shrink-0" />
                            <span>Continue Learning</span>
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Cart Items */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <ShoppingCart className="w-6 h-6" style={{ color: colors.primary }} />
            <Heading as="h2" size="h2">Cart Items ({cartItems.length})</Heading>
          </div>

          {cartItems.length === 0 ? (
            <Card variant="default" className="p-12 text-center">
              <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-50" style={{ color: colors.primary }} />
              <Text size="lg" variant="muted" className="mb-4">Your cart is empty</Text>
              <Button asChild variant="default">
                <Link href="/">Browse Courses</Link>
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {cartItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card variant="default" hover={true} className="overflow-hidden">
                    <Link href={`/courses/${item.course.slug}`}>
                      <div className="relative aspect-video" style={{ backgroundColor: colors.primary }}>
                        {((item.course as any).featured_image || item.course.thumbnail) ? (
                          <img
                            src={(item.course as any).featured_image || item.course.thumbnail}
                            alt={item.course.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              if (target) target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-white text-4xl font-extrabold">
                              {item.course.title?.charAt(0)?.toUpperCase() || '?'}
                            </span>
                          </div>
                        )}
                      </div>
                    </Link>
                    
                    <div className="p-6">
                      <Link href={`/courses/${item.course.slug}`}>
                        <Heading as="h3" size="h5" className="mb-3 line-clamp-2 transition-colors group-hover:text-[#00d084]">
                          {item.course.title || 'Untitled Course'}
                        </Heading>
                      </Link>
                      
                      <div className="flex items-center justify-between">
                        <Text size="lg" className="font-bold">
                          {formatPrice(item.course.price || 0)}
                        </Text>
                        <Button asChild variant="default" size="sm">
                          <Link href="/cart">
                            <ShoppingCart className="w-4 h-4" />
                            View Cart
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
