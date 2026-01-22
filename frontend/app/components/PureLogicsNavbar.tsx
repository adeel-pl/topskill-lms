'use client';

import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { ShoppingCart, ChevronDown, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PureLogicsNavbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-[1400px] xl:max-w-[1600px] 2xl:max-w-[1800px] mx-auto w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
        <div className="flex items-center justify-between h-16 sm:h-18 md:h-20 gap-2 sm:gap-3 md:gap-4 w-full">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 flex-shrink-0 group min-w-0">
            <motion.div
              className="flex items-center flex-shrink-0"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <img
                src="https://topskills.pk/wp-content/uploads/2024/08/Group-27515-2048x623.png"
                alt="TopSkill"
                className="h-8 sm:h-9 md:h-10 w-auto"
                style={{ maxWidth: '200px' }}
              />
            </motion.div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden lg:flex items-center gap-6 flex-shrink-0">
            <Link
              href="/"
              className="text-gray-900 hover:text-[#10B981] text-sm font-medium transition-colors"
            >
              Home
            </Link>
            <Link
              href="/courses"
              className="text-gray-900 hover:text-[#10B981] text-sm font-medium transition-colors flex items-center gap-1"
            >
              Category
              <ChevronDown className="w-4 h-4" />
            </Link>
            <Link
              href="/courses"
              className="text-gray-900 hover:text-[#10B981] text-sm font-medium transition-colors"
            >
              Product
            </Link>
            <Link
              href="/instructors"
              className="text-gray-900 hover:text-[#10B981] text-sm font-medium transition-colors"
            >
              Community
            </Link>
            <Link
              href="/instructors"
              className="text-gray-900 hover:text-[#10B981] text-sm font-medium transition-colors"
            >
              Teach
            </Link>
          </div>

          {/* Right Side Actions */}
          <div className="navbar-right-actions flex items-center gap-1.5 sm:gap-2 md:gap-3 flex-shrink-0">
            <Link href="/cart" className="text-gray-900 hover:text-[#10B981] p-2 sm:p-2.5 rounded-lg hover:bg-gray-100 transition-colors relative flex-shrink-0">
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard/my-courses"
                  className="text-gray-900 hover:text-[#10B981] px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 border border-gray-300 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-colors hover:bg-gray-50 hover:border-[#10B981] hidden lg:block"
                >
                  My Learning
                </Link>
                <motion.button
                  onClick={logout}
                  className="bg-[#10B981] hover:bg-[#10B981]/90 text-white px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-300 shadow-lg shadow-[#10B981]/20 hidden lg:block"
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
                  className="text-gray-900 hover:text-[#10B981] px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 border border-gray-300 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-colors hover:bg-gray-50 hover:border-[#10B981] hidden lg:block"
                >
                  Login
                </Link>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="hidden lg:block">
                  <Link
                    href="/register"
                    className="bg-[#10B981] hover:bg-[#10B981]/90 text-white px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-300 shadow-lg shadow-[#10B981]/20 inline-block"
                  >
                    Sign up
                  </Link>
                </motion.div>
              </>
            )}
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="mobile-menu-toggle block text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0 lg:hidden"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
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
              className="lg:hidden border-t border-gray-200 py-4 overflow-hidden bg-white"
            >
              <div className="flex flex-col gap-2">
                <Link href="/" className="text-gray-900 hover:text-[#10B981] px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                  Home
                </Link>
                <Link href="/courses" className="text-gray-900 hover:text-[#10B981] px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                  Category
                </Link>
                <Link href="/courses" className="text-gray-900 hover:text-[#10B981] px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                  Product
                </Link>
                <Link href="/instructors" className="text-gray-900 hover:text-[#10B981] px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                  Community
                </Link>
                <Link href="/instructors" className="text-gray-900 hover:text-[#10B981] px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                  Teach
                </Link>
                {isAuthenticated ? (
                  <>
                    <Link href="/dashboard/my-courses" className="text-gray-900 hover:text-[#10B981] px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                      My Learning
                    </Link>
                    <button onClick={logout} className="text-left text-gray-900 hover:text-[#10B981] px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="text-gray-900 hover:text-[#10B981] px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                      Login
                    </Link>
                    <Link href="/register" className="text-gray-900 hover:text-[#10B981] px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm">
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
