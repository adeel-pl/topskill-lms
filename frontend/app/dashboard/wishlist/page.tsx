'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { wishlistAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { FiHeart, FiBookOpen, FiTrash2 } from 'react-icons/fi';
import { useToast } from '@/app/contexts/ToastContext';

export default function WishlistPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();
  const { showError, showSuccess } = useToast();
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (isAuthenticated) {
      loadWishlist();
    }
  }, [isAuthenticated, isLoading]);

  const loadWishlist = async () => {
    try {
      const response = await wishlistAPI.getAll();
      setWishlist(response.data.results || response.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading wishlist:', error);
      setWishlist([]);
      setLoading(false);
    }
  };

  const removeFromWishlist = async (id: number) => {
    try {
      await wishlistAPI.remove(id);
      showSuccess('Removed from wishlist');
      loadWishlist();
    } catch (error) {
      showError('Failed to remove from wishlist');
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#334155] border-t-[#048181] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#9CA3AF]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 md:py-12 text-white">
      <div className="mb-8 md:mb-12">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-2 text-white">
          Wishlist
        </h1>
        <p className="text-[#9CA3AF] text-base md:text-lg">Your saved courses</p>
      </div>

      {wishlist.length === 0 ? (
        <div className="text-center py-16 md:py-20">
          <div className="bg-[#1E293B] border border-[#334155] rounded-2xl p-12 md:p-16 max-w-md mx-auto">
            <div className="w-20 md:w-24 h-20 md:h-24 bg-[#EC4899]/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiHeart className="text-4xl md:text-5xl text-[#EC4899]" />
            </div>
            <h2 className="text-2xl md:text-3xl font-black mb-4 text-white">Your wishlist is empty</h2>
            <p className="text-[#9CA3AF] mb-6 md:mb-8">Add courses to your wishlist to save them for later!</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-[#048181] text-white px-8 py-4 rounded-xl font-black transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#048181]/50"
            >
              <FiBookOpen />
              Browse Courses
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 lg:gap-8">
          {wishlist.map((item, idx) => (
            <div
              key={item.id}
              className="bg-[#1E293B] border border-[#334155] rounded-2xl p-5 md:p-6 hover:bg-[#334155] hover:border-[#048181] transition-all duration-500 hover:scale-105 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#048181]/20"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg md:text-xl font-black text-white flex-1 pr-4 line-clamp-2">{item.course?.title || 'Course'}</h3>
                <button
                  onClick={() => removeFromWishlist(item.id)}
                  className="text-[#EF4444] hover:text-[#FCA5A5] transition-colors p-2 hover:bg-[#EF4444]/10 rounded-xl flex-shrink-0"
                  title="Remove from wishlist"
                >
                  <FiTrash2 className="text-xl" />
                </button>
              </div>
              <p className="text-[#9CA3AF] mb-5 md:mb-6 text-sm line-clamp-2">{item.course?.description || ''}</p>
              <div className="flex items-center justify-between pt-5 md:pt-6 border-t border-[#334155]">
                <div className="text-xl md:text-2xl font-black text-[#048181]">${item.course?.price || 0}</div>
                <Link
                  href={`/courses/${item.course?.slug}`}
                  className="bg-[#048181] hover:bg-[#048181] text-white px-4 md:px-5 py-2 md:py-2.5 rounded-xl font-black transition-all duration-300 hover:scale-105 text-sm"
                >
                  View Course
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
