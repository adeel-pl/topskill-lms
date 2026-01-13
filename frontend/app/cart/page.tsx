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
      console.error('Error loading cart:', error);
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
      console.log('Checkout response:', response);
      
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
      console.error('Checkout error:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Checkout failed. Please try again.';
      showError(errorMessage);
      setCheckingOut(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background.primary }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 rounded-full animate-spin mx-auto mb-4" style={{ borderColor: colors.border.primary, borderTopColor: colors.accent.primary }}></div>
          <p style={{ color: colors.text.muted }}>Loading cart...</p>
        </div>
      </div>
    );
  }

  const itemCount = cart?.items?.length || 0;

  return (
    <div className="min-h-screen pt-16 md:pt-20" style={{ backgroundColor: colors.background.primary, color: colors.text.dark }}>
      <PureLogicsNavbar />

      <div className="max-w-[1400px] xl:max-w-[1600px] 2xl:max-w-[1800px] mx-auto w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 py-10 md:py-12 relative z-10">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-2 md:mb-3" style={{ color: colors.text.dark }}>
          Shopping Cart
        </h1>
        <p className="text-sm md:text-base lg:text-lg mb-6 md:mb-8 lg:mb-12" style={{ color: colors.text.muted }}>{itemCount} {itemCount === 1 ? 'Course' : 'Courses'} in Cart</p>

        {!cart || !cart.items || cart.items.length === 0 ? (
          <div className="text-center py-16 md:py-20">
            <div className="rounded-2xl p-10 md:p-12 lg:p-16 max-w-md mx-auto" style={{ backgroundColor: colors.background.secondary, borderColor: colors.border.primary, borderWidth: '1px', borderStyle: 'solid' }}>
              <div className="w-20 md:w-24 h-20 md:h-24 rounded-full flex items-center justify-center mx-auto mb-5 md:mb-6" style={{ backgroundColor: `${colors.accent.primary}20` }}>
                <FiShoppingCart className="text-4xl md:text-5xl" style={{ color: colors.accent.primary }} />
              </div>
              <h2 className="text-2xl md:text-3xl font-black mb-3 md:mb-4" style={{ color: colors.text.dark }}>Your cart is empty</h2>
              <p className="mb-5 md:mb-6 lg:mb-8 text-sm md:text-base" style={{ color: colors.text.muted }}>Keep shopping to find a course!</p>
              <Link
                href="/courses"
                className="inline-block px-7 md:px-8 py-3.5 md:py-4 rounded-xl font-black transition-all duration-300 hover:scale-105 hover:shadow-2xl text-sm md:text-base"
                style={{ backgroundColor: colors.button.primary, color: colors.text.white }}
              >
                Keep shopping
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6 lg:gap-8">
            <div className="lg:col-span-2 space-y-4 md:space-y-5 lg:space-y-6">
              {cart.items.map((item: any, idx: number) => (
                <div
                  key={item.id}
                  className="rounded-2xl p-4 md:p-5 lg:p-6 transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1"
                  style={{ 
                    backgroundColor: colors.background.secondary, 
                    borderColor: colors.border.primary, 
                    borderWidth: '1px', 
                    borderStyle: 'solid',
                    animationDelay: `${idx * 100}ms` 
                  }}
                >
                  <div className="flex items-start gap-4 md:gap-5 lg:gap-6">
                    <div className="w-24 md:w-28 lg:w-32 h-20 md:h-24 lg:h-28 rounded-xl overflow-hidden flex-shrink-0" style={{ backgroundColor: colors.accent.primary }}>
                      {item.course?.thumbnail ? (
                        <img src={item.course.thumbnail} alt={item.course.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-white text-xl md:text-2xl font-black">{item.course?.title?.charAt(0) || 'C'}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base md:text-lg lg:text-xl font-black mb-1.5 md:mb-2" style={{ color: colors.text.dark }}>{item.course?.title || 'Course'}</h3>
                      <p className="text-xs md:text-sm mb-3 md:mb-4 line-clamp-2" style={{ color: colors.text.muted }}>{item.course?.description || ''}</p>
                      <div className="flex items-center justify-between">
                        <div className="text-lg md:text-xl lg:text-2xl font-black" style={{ color: colors.accent.primary }}>${item.course?.price || 0}</div>
                        <button
                          onClick={() => removeItem(item.course?.id)}
                          className="p-2 md:p-2.5 rounded-xl transition-all duration-300"
                          style={{ color: colors.text.muted }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#EF4444';
                            e.currentTarget.style.backgroundColor = '#EF444410';
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
                </div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-20 md:top-24 rounded-2xl p-5 md:p-6 lg:p-8 shadow-2xl transition-all duration-500" style={{ backgroundColor: colors.background.secondary, borderColor: colors.border.primary, borderWidth: '2px', borderStyle: 'solid' }}>
                <h2 className="text-xl md:text-2xl font-black mb-4 md:mb-5 lg:mb-6" style={{ color: colors.text.dark }}>Total</h2>
                <div className="text-3xl md:text-4xl lg:text-5xl font-black mb-5 md:mb-6 lg:mb-8" style={{ color: colors.accent.primary }}>${cart.total || 0}</div>
                <button
                  onClick={handleCheckout}
                  disabled={checkingOut || itemCount === 0}
                  className="w-full py-3.5 md:py-4 lg:py-5 rounded-xl font-black text-base md:text-lg transition-all duration-300 mb-3 md:mb-4 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 hover:shadow-2xl flex items-center justify-center gap-2"
                  style={{ backgroundColor: colors.button.primary, color: colors.text.white }}
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
                </button>
                <Link
                  href="/courses"
                  className="block text-center font-bold text-xs md:text-sm transition-colors py-2.5 md:py-3 rounded-xl"
                  style={{ color: colors.text.muted }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = colors.accent.primary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = colors.text.muted;
                  }}
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
