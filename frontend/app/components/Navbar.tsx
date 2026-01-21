'use client';

import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { FiUser, FiShoppingCart, FiHeart, FiBookOpen } from 'react-icons/fi';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-bold text-[#2563eb]">
            TopSkill LMS
          </Link>
          
          <nav className="flex items-center gap-6">
            <Link href="/courses" className="text-gray-700 hover:text-[#2563eb] font-medium">
              Courses
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link href="/cart" className="text-gray-700 hover:text-[#2563eb] relative">
                  <FiShoppingCart className="text-xl" />
                </Link>
                <Link href="/dashboard/wishlist" className="text-gray-700 hover:text-[#2563eb]">
                  <FiHeart className="text-xl" />
                </Link>
                <div className="relative group">
                  <button className="flex items-center gap-2 text-gray-700 hover:text-[#2563eb]">
                    <FiUser className="text-xl" />
                    <span>{user?.first_name || user?.username}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <Link href="/dashboard/my-courses" className="block px-4 py-2 hover:bg-gray-50 flex items-center gap-2">
                      <FiBookOpen />
                      My Courses
                    </Link>
                    <Link href="/dashboard/certifications" className="block px-4 py-2 hover:bg-gray-50">
                      Certifications
                    </Link>
                    <Link href="/dashboard/account" className="block px-4 py-2 hover:bg-gray-50">
                      Account
                    </Link>
                    <button
                      onClick={logout}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-red-600"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-700 hover:text-[#2563eb]">
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-[#2563eb] text-white px-4 py-2 rounded-lg hover:bg-[#1e40af] transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}





































