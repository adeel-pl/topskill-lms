'use client';

import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { Search, ShoppingCart, Globe, ChevronDown, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PureLogicsNavbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const [showExplore, setShowExplore] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0F172A]/95 backdrop-blur-xl border-b border-[#334155] shadow-lg">
      <div className="max-w-[1400px] xl:max-w-[1600px] 2xl:max-w-[1800px] mx-auto w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
        <div className="flex items-center justify-between h-20 gap-4 w-full">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0 group">
            <motion.div
              className="w-10 h-10 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-xl flex items-center justify-center shadow-lg shadow-[#10B981]/30"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-5 h-5 bg-[#0F172A] rounded-lg"></div>
            </motion.div>
            <span className="text-xl font-black text-white">
              Pure<span className="text-[#10B981]">Logics</span>
            </span>
          </Link>

          {/* Explore Dropdown */}
          <div className="relative hidden md:block explore-dropdown">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowExplore(!showExplore);
              }}
              className="text-[#D1D5DB] px-4 py-2 hover:bg-[#1E293B] rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
            >
              Explore
              <ChevronDown className={`w-4 h-4 transition-transform ${showExplore ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {showExplore && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-0 mt-2 bg-[#1E293B] rounded-xl shadow-2xl w-64 py-2 z-50 border border-[#334155]"
                >
                  <Link href="/courses?category=development" className="block px-4 py-3 text-[#D1D5DB] hover:bg-[#334155] hover:text-[#10B981] text-sm transition-colors">
                    Development
                  </Link>
                  <Link href="/courses?category=business" className="block px-4 py-3 text-[#D1D5DB] hover:bg-[#334155] hover:text-[#10B981] text-sm transition-colors">
                    Business
                  </Link>
                  <Link href="/courses?category=design" className="block px-4 py-3 text-[#D1D5DB] hover:bg-[#334155] hover:text-[#10B981] text-sm transition-colors">
                    Design
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Search Bar */}
          <form 
            className="flex-1 max-w-2xl mx-4 hidden md:block"
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const input = form.querySelector('input') as HTMLInputElement;
              if (input?.value.trim()) {
                window.location.href = `/courses?search=${encodeURIComponent(input.value.trim())}`;
              }
            }}
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#9CA3AF] w-5 h-5" />
              <input
                type="text"
                placeholder="Search for anything"
                className="w-full pl-11 pr-4 py-3 bg-[#1E293B] border border-[#334155] rounded-full text-white placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all text-sm"
              />
            </div>
          </form>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link href="/courses" className="text-[#D1D5DB] hover:text-white text-sm font-medium hidden lg:block whitespace-nowrap transition-colors">
              Plans & Pricing
            </Link>
            <Link href="/instructors" className="text-[#D1D5DB] hover:text-white text-sm font-medium hidden lg:block whitespace-nowrap transition-colors">
              Instructors
            </Link>
            <Link href="/cart" className="text-[#D1D5DB] hover:text-white p-2.5 rounded-lg hover:bg-[#1E293B] transition-colors relative">
              <ShoppingCart className="w-5 h-5" />
            </Link>
            <button className="text-[#D1D5DB] hover:text-white p-2.5 rounded-lg hover:bg-[#1E293B] transition-colors hidden md:block">
              <Globe className="w-5 h-5" />
            </button>
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard/my-courses"
                  className="text-[#D1D5DB] hover:text-white px-5 py-2.5 border border-[#334155] rounded-lg text-sm font-medium whitespace-nowrap transition-colors hover:bg-[#1E293B] hover:border-[#10B981] hidden sm:block"
                >
                  My Learning
                </Link>
                <motion.button
                  onClick={logout}
                  className="bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#10B981] text-white px-5 py-2.5 rounded-lg text-sm font-bold whitespace-nowrap transition-all duration-300 shadow-lg shadow-[#10B981]/20"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Log out
                </motion.button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-[#D1D5DB] hover:text-white px-5 py-2.5 border border-[#334155] rounded-lg text-sm font-medium whitespace-nowrap transition-colors hover:bg-[#1E293B] hover:border-[#10B981] hidden sm:block"
                >
                  Log in
                </Link>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/register"
                    className="bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#10B981] text-white px-5 py-2.5 rounded-lg text-sm font-bold whitespace-nowrap transition-all duration-300 shadow-lg shadow-[#10B981]/20 inline-block"
                  >
                    Sign up
                  </Link>
                </motion.div>
              </>
            )}
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white p-2 rounded-lg hover:bg-[#1E293B] transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-[#334155] py-4 overflow-hidden"
            >
              <div className="flex flex-col gap-2">
                <Link href="/courses" className="text-[#D1D5DB] hover:text-white px-4 py-2 rounded-lg hover:bg-[#1E293B] transition-colors text-sm">
                  Plans & Pricing
                </Link>
                <Link href="/instructors" className="text-[#D1D5DB] hover:text-white px-4 py-2 rounded-lg hover:bg-[#1E293B] transition-colors text-sm">
                  Instructors
                </Link>
                {isAuthenticated ? (
                  <>
                    <Link href="/dashboard/my-courses" className="text-[#D1D5DB] hover:text-white px-4 py-2 rounded-lg hover:bg-[#1E293B] transition-colors text-sm">
                      My Learning
                    </Link>
                    <button onClick={logout} className="text-left text-[#D1D5DB] hover:text-white px-4 py-2 rounded-lg hover:bg-[#1E293B] transition-colors text-sm">
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="text-[#D1D5DB] hover:text-white px-4 py-2 rounded-lg hover:bg-[#1E293B] transition-colors text-sm">
                      Log in
                    </Link>
                    <Link href="/register" className="text-[#D1D5DB] hover:text-white px-4 py-2 rounded-lg hover:bg-[#1E293B] transition-colors text-sm">
                      Sign up
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
