'use client';

import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { FiSearch, FiShoppingCart, FiGlobe, FiChevronDown } from 'react-icons/fi';
import { useState } from 'react';

export default function UdemyNavbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const [showExplore, setShowExplore] = useState(false);

  return (
    <header className="bg-[#1c1d1f] border-b border-[#3e4143] sticky top-0 z-50">
      <div className="max-w-full mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-white text-2xl font-bold">udemy</span>
          </Link>

          {/* Explore Dropdown */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setShowExplore(!showExplore)}
              className="text-white px-4 py-2 hover:bg-[#3e4143] rounded-sm flex items-center gap-1 text-sm font-medium"
            >
              Explore
              <FiChevronDown className="text-xs" />
            </button>
            {showExplore && (
              <div className="absolute top-full left-0 mt-1 bg-white rounded-sm shadow-lg w-64 py-2">
                <Link href="/courses" className="block px-4 py-2 text-gray-900 hover:bg-gray-100 text-sm">
                  Development
                </Link>
                <Link href="/courses" className="block px-4 py-2 text-gray-900 hover:bg-gray-100 text-sm">
                  Business
                </Link>
                <Link href="/courses" className="block px-4 py-2 text-gray-900 hover:bg-gray-100 text-sm">
                  Design
                </Link>
              </div>
            )}
          </div>

          {/* Search Bar */}
          <form className="flex-1 max-w-3xl mx-8 hidden md:block">
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search for anything"
                className="w-full pl-12 pr-4 py-2.5 bg-white border border-gray-300 rounded-sm focus:outline-none focus:border-[#5624d0] text-gray-900 text-sm"
              />
            </div>
          </form>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            <Link href="/courses" className="text-white hover:text-gray-300 text-sm font-medium hidden lg:block">
              Plans & Pricing
            </Link>
            <Link href="/instructors" className="text-white hover:text-gray-300 text-sm font-medium hidden lg:block">
              Instructors
            </Link>
            <Link href="/cart" className="text-white hover:text-gray-300 p-2">
              <FiShoppingCart className="text-xl" />
            </Link>
            <button className="text-white hover:text-gray-300 p-2 hidden md:block">
              <FiGlobe className="text-xl" />
            </button>
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard/my-courses"
                  className="text-white hover:text-gray-300 px-4 py-2 border border-white rounded-sm text-sm font-medium"
                >
                  My Learning
                </Link>
                <button
                  onClick={logout}
                  className="bg-white text-[#1c1d1f] hover:bg-gray-100 px-4 py-2 rounded-sm text-sm font-bold"
                >
                  Log in
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-white hover:text-gray-300 px-4 py-2 border border-white rounded-sm text-sm font-medium"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="bg-white text-[#1c1d1f] hover:bg-gray-100 px-4 py-2 rounded-sm text-sm font-bold"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}




































