'use client';

import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { FiSearch, FiShoppingCart, FiGlobe, FiChevronDown } from 'react-icons/fi';
import { useState, useEffect } from 'react';

export default function PureLogicsNavbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const [showExplore, setShowExplore] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showExplore && !(event.target as Element).closest('.explore-dropdown')) {
        setShowExplore(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showExplore]);

  return (
    <header className="bg-[#000F2C] border-b border-[#1a2a4a] sticky top-0 z-50">
      <div className="max-w-[1344px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="relative">
              <div className="w-8 h-8 bg-[#66CC33] rounded-sm flex items-center justify-center">
                <div className="w-4 h-4 bg-[#4da826] rounded-sm"></div>
              </div>
            </div>
            <span className="text-white text-xl font-bold whitespace-nowrap" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              Pure<span className="font-normal">Logics</span>
            </span>
          </Link>

          {/* Explore Dropdown */}
          <div className="relative hidden md:block explore-dropdown">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowExplore(!showExplore);
              }}
              className="text-white px-4 py-2 hover:bg-[#1a2a4a] rounded-sm flex items-center gap-1 text-sm font-medium transition-colors"
            >
              Explore
              <FiChevronDown className={`text-xs transition-transform ${showExplore ? 'rotate-180' : ''}`} />
            </button>
            {showExplore && (
              <div className="absolute top-full left-0 mt-1 bg-white rounded-sm shadow-lg w-64 py-2 z-50">
                <Link href="/courses" className="block px-4 py-2 text-[#000F2C] hover:bg-gray-100 text-sm transition-colors">
                  Development
                </Link>
                <Link href="/courses" className="block px-4 py-2 text-[#000F2C] hover:bg-gray-100 text-sm transition-colors">
                  Business
                </Link>
                <Link href="/courses" className="block px-4 py-2 text-[#000F2C] hover:bg-gray-100 text-sm transition-colors">
                  Design
                </Link>
              </div>
            )}
          </div>

          {/* Search Bar */}
          <form className="flex-1 max-w-3xl mx-4 hidden md:block">
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search for anything"
                className="w-full pl-12 pr-4 py-2.5 bg-white border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#66CC33] focus:border-[#66CC33] text-[#000F2C] text-sm"
              />
            </div>
          </form>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link href="/courses" className="text-white hover:text-[#66CC33] text-sm font-medium hidden lg:block whitespace-nowrap transition-colors">
              Plans & Pricing
            </Link>
            <Link href="/instructors" className="text-white hover:text-[#66CC33] text-sm font-medium hidden lg:block whitespace-nowrap transition-colors">
              Instructors
            </Link>
            <Link href="/cart" className="text-white hover:text-[#66CC33] p-2 transition-colors">
              <FiShoppingCart className="text-xl" />
            </Link>
            <button className="text-white hover:text-[#66CC33] p-2 hidden md:block transition-colors">
              <FiGlobe className="text-xl" />
            </button>
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard/my-courses"
                  className="text-white hover:text-[#66CC33] px-4 py-2 border border-white rounded-sm text-sm font-medium whitespace-nowrap transition-colors"
                >
                  My Learning
                </Link>
                <button
                  onClick={logout}
                  className="bg-[#66CC33] text-[#000F2C] hover:bg-[#4da826] px-4 py-2 rounded-sm text-sm font-bold whitespace-nowrap transition-colors"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-white hover:text-[#66CC33] px-4 py-2 border border-white rounded-sm text-sm font-medium whitespace-nowrap transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="bg-[#66CC33] text-[#000F2C] hover:bg-[#4da826] px-4 py-2 rounded-sm text-sm font-bold whitespace-nowrap transition-colors"
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
