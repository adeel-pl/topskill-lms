'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { cartAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import PureLogicsNavbar from '@/app/components/PureLogicsNavbar';
import { FiTrash2, FiShoppingCart } from 'react-icons/fi';

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();
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
      // Handle both list and single object response
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
      loadCart();
    } catch (error) {
      alert('Failed to remove item');
    }
  };

  const handleCheckout = async () => {
    if (!cart || !cart.items || cart.items.length === 0) {
      alert('Your cart is empty');
      return;
    }

    setCheckingOut(true);
    try {
      const response = await cartAPI.checkout();
      console.log('Checkout response:', response);
      
      if (response.data && response.data.payment_url) {
        // Redirect to payment gateway
        window.location.href = response.data.payment_url;
      } else if (response.data && response.data.enrolled) {
        // Direct enrollment (development mode - no payment gateway configured)
        alert(`Successfully enrolled in ${response.data.enrollments_count} course(s)!`);
        router.push('/dashboard/my-courses');
        loadCart(); // Refresh cart
      } else {
        alert('Payment URL not available. Please try enrolling directly from the course page.');
        setCheckingOut(false);
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Checkout failed. Please try again.';
      alert(errorMessage);
      setCheckingOut(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-[#66CC33] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading cart...</p>
        </div>
      </div>
    );
  }

  const itemCount = cart?.items?.length || 0;

  return (
    <div className="min-h-screen bg-white">
      <PureLogicsNavbar />

      <div className="max-w-[1344px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-2 text-[#000F2C]">Shopping Cart</h1>
        <p className="text-[#6a6f73] mb-8 text-sm">{itemCount} {itemCount === 1 ? 'Course' : 'Courses'} in Cart</p>

        {!cart || !cart.items || cart.items.length === 0 ? (
          <div className="text-center py-20 bg-white border border-gray-200 rounded-sm">
            <div className="w-24 h-24 mx-auto mb-4 flex items-center justify-center">
              <FiShoppingCart className="text-6xl text-gray-300" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-[#000F2C]">Your cart is empty. Keep shopping to find a course!</h2>
            <Link
              href="/courses"
              className="inline-block mt-6 bg-[#66CC33] hover:bg-[#4da826] text-[#000F2C] px-6 py-3 rounded-sm font-bold transition-colors"
            >
              Keep shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item: any) => (
                <div
                  key={item.id}
                  className="bg-white border border-gray-200 rounded-sm p-6 flex items-start gap-4"
                >
                  <div className="w-32 h-20 bg-gradient-to-br from-[#66CC33] to-[#4da826] rounded-sm flex-shrink-0"></div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-1 text-[#000F2C]">{item.course?.title || 'Course'}</h3>
                    <p className="text-sm text-[#6a6f73] mb-3 line-clamp-2">{item.course?.description || ''}</p>
                    <div className="flex items-center justify-between">
                      <div className="text-xl font-bold text-[#000F2C]">${item.course?.price || 0}</div>
                      <button
                        onClick={() => removeItem(item.course?.id)}
                        className="text-[#6a6f73] hover:text-red-500 transition-colors"
                      >
                        <FiTrash2 className="text-lg" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white border-2 border-gray-300 rounded-sm p-6 sticky top-24">
                <h2 className="text-xl font-bold mb-4 text-[#000F2C]">Total:</h2>
                <div className="text-3xl font-bold mb-6 text-[#000F2C]">${cart.total || 0}</div>
                <button
                  onClick={handleCheckout}
                  disabled={checkingOut || itemCount === 0}
                  className="w-full bg-[#66CC33] hover:bg-[#4da826] text-[#000F2C] py-3.5 rounded-sm font-bold text-base transition-colors mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {checkingOut ? 'Processing...' : 'Checkout'}
                </button>
                <Link
                  href="/courses"
                  className="block text-center text-[#000F2C] hover:text-[#66CC33] font-semibold text-sm transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
