'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { cartAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import PureLogicsNavbar from '@/app/components/PureLogicsNavbar';
import Footer from '@/app/components/Footer';
import { FiTrash2, FiShoppingCart, FiArrowRight } from 'react-icons/fi';
import { useToast } from '@/app/contexts/ToastContext';
import { Container } from '@/app/components/ui/container';
import { Heading } from '@/app/components/ui/heading';
import { Text } from '@/app/components/ui/text';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { colors } from '@/lib/colors';

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();
  const { showSuccess, showError, showWarning } = useToast();
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (isAuthenticated) {
      loadCart();
    }
  }, [isAuthenticated, isLoading]);

  const loadCart = async () => {
    try {
      const response = await cartAPI.get();
      const cartData = Array.isArray(response.data) ? response.data[0] : response.data;
      setCart(cartData);
      setLoading(false);
    } catch (error) {
      setCart(null);
      setLoading(false);
    }
  };

  const removeItem = async (courseId: number) => {
    try {
      await cartAPI.removeItem(courseId);
      showSuccess('Item removed from cart');
      loadCart();
    } catch (error) {
      showError('Failed to remove item');
    }
  };

  const handleCheckout = async () => {
    if (!cart || !cart.items || cart.items.length === 0) {
      showWarning('Your cart is empty');
      return;
    }

    setCheckingOut(true);
    try {
      const response = await cartAPI.checkout();
      
      if (response.data && response.data.payment_url) {
        window.location.href = response.data.payment_url;
      } else if (response.data && response.data.enrolled) {
        showSuccess(`Successfully enrolled in ${response.data.enrollments_count} course(s)!`);
        setTimeout(() => {
          router.push('/dashboard/my-courses');
        }, 1500);
        loadCart();
      } else {
        showWarning('Payment URL not available. Please try enrolling directly from the course page.');
        setCheckingOut(false);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Checkout failed. Please try again.';
      showError(errorMessage);
      setCheckingOut(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 rounded-full animate-spin mx-auto mb-4" style={{ borderColor: colors.border.primary, borderTopColor: colors.primary }}></div>
          <Text variant="muted">Loading cart...</Text>
        </div>
      </div>
    );
  }

  const itemCount = cart?.items?.length || 0;

  return (
    <div className="min-h-screen bg-white">
      <PureLogicsNavbar />

      <Container size="2xl" className="pb-10 md:pb-12 pt-20">
        <Heading as="h1" size="h1" className="mb-2 md:mb-3">Shopping Cart</Heading>
        <Text variant="muted" size="lg" className="mb-6 md:mb-8 lg:mb-12">{itemCount} {itemCount === 1 ? 'Course' : 'Courses'} in Cart</Text>

        {!cart || !cart.items || cart.items.length === 0 ? (
          <div className="text-center py-16 md:py-20">
            <Card variant="default" className="p-10 md:p-12 lg:p-16 max-w-md mx-auto">
              <div className="w-20 md:w-24 h-20 md:h-24 rounded-full flex items-center justify-center mx-auto mb-5 md:mb-6" style={{ backgroundColor: `${colors.primary}20` }}>
                <FiShoppingCart className="text-4xl md:text-5xl" style={{ color: colors.primary }} />
              </div>
              <Heading as="h2" size="h2" className="mb-3 md:mb-4">Your cart is empty</Heading>
              <Text variant="muted" size="sm" className="mb-5 md:mb-6 lg:mb-8">Keep shopping to find a course!</Text>
              <Link href="/">
                <Button variant="default" size="lg">Keep shopping</Button>
              </Link>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
            <div className="lg:col-span-2 space-y-4 md:space-y-5 lg:space-y-6">
              {cart.items.map((item: any) => (
                <Card
                  key={item.id}
                  variant="default"
                  hover={true}
                  className="p-4 md:p-5 lg:p-6"
                >
                  <div className="flex items-start gap-4 md:gap-5 lg:gap-6">
                    <div className="w-24 md:w-28 lg:w-32 h-20 md:h-24 lg:h-28 rounded-xl overflow-hidden flex-shrink-0" style={{ backgroundColor: colors.primary }}>
                      {(item.course?.featured_image || item.course?.thumbnail) ? (
                        <img 
                          src={item.course.featured_image || item.course.thumbnail} 
                          alt={item.course.title} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            if (target) target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-white text-xl md:text-2xl font-black">{item.course?.title?.charAt(0) || 'C'}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Heading as="h3" size="h5" className="mb-1.5 md:mb-2">{item.course?.title || 'Course'}</Heading>
                      {item.course?.description && (
                        <Text variant="muted" size="sm" className="mb-3 md:mb-4 line-clamp-2">{item.course.description}</Text>
                      )}
                      <div className="flex items-center justify-between">
                        <Text size="lg" className="font-bold" style={{ color: colors.primary }}>${item.course?.price || 0}</Text>
                        <button
                          onClick={() => removeItem(item.course?.id)}
                          className="p-2 md:p-2.5 rounded-xl transition-all duration-300"
                          style={{ color: colors.text.muted }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = colors.status.error;
                            e.currentTarget.style.backgroundColor = `${colors.status.error}10`;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = colors.text.muted;
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          <FiTrash2 className="text-lg md:text-xl" />
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="lg:col-span-1">
              <Card variant="default" className="sticky top-20 md:top-24 p-5 md:p-6 lg:p-8">
                <Heading as="h2" size="h3" className="mb-4 md:mb-5 lg:mb-6">Total</Heading>
                <Text size="lg" className="font-bold mb-5 md:mb-6 lg:mb-8 text-3xl" style={{ color: colors.primary }}>${cart.total || 0}</Text>
                <Button
                  onClick={handleCheckout}
                  disabled={checkingOut || itemCount === 0}
                  variant="default"
                  size="lg"
                  className="w-full mb-3 md:mb-4"
                >
                  {checkingOut ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      Checkout
                      <FiArrowRight className="text-lg md:text-xl" />
                    </>
                  )}
                </Button>
                <Link
                  href="/"
                  className="block text-center font-semibold text-sm transition-colors py-2.5 md:py-3 rounded-xl"
                  style={{ color: colors.text.muted }}
                  onMouseEnter={(e) => e.currentTarget.style.color = colors.primary}
                  onMouseLeave={(e) => e.currentTarget.style.color = colors.text.muted}
                >
                  Continue Shopping
                </Link>
              </Card>
            </div>
          </div>
        )}
      </Container>

      <Footer />
    </div>
  );
}
