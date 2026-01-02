'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { wishlistAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { FiHeart, FiBookOpen, FiTrash2 } from 'react-icons/fi';

export default function WishlistPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();
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
      loadWishlist();
    } catch (error) {
      alert('Failed to remove from wishlist');
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-[#66CC33] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#000F2C] mb-1">Wishlist</h1>
        <p className="text-[#6a6f73] text-sm">Your saved courses</p>
      </div>

      {wishlist.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-sm border border-gray-200">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
            <FiHeart className="text-3xl text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-[#000F2C]">Your wishlist is empty</h2>
          <p className="text-[#6a6f73] mb-6">Add courses to your wishlist to save them for later!</p>
          <Link
            href="/courses"
            className="bg-[#66CC33] hover:bg-[#4da826] text-[#000F2C] px-6 py-3 rounded-sm font-semibold inline-block transition-all duration-200 flex items-center gap-2 mx-auto w-fit"
          >
            <FiBookOpen />
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((item) => (
            <div key={item.id} className="bg-white border border-gray-200 rounded-sm p-6 hover:shadow-md transition-all duration-200">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold text-[#000F2C] flex-1 pr-4">{item.course?.title || 'Course'}</h3>
                <button
                  onClick={() => removeFromWishlist(item.id)}
                  className="text-red-500 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-sm"
                  title="Remove from wishlist"
                >
                  <FiTrash2 className="text-lg" />
                </button>
              </div>
              <p className="text-[#6a6f73] mb-4 text-sm line-clamp-2">{item.course?.description || ''}</p>
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="text-2xl font-bold text-[#000F2C]">${item.course?.price || 0}</div>
                <Link
                  href={`/courses/${item.course?.slug}`}
                  className="bg-[#66CC33] hover:bg-[#4da826] text-[#000F2C] px-4 py-2 rounded-sm font-semibold transition-all duration-200 text-sm"
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
