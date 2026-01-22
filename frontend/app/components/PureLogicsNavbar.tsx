'use client';

import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { ShoppingCart, ChevronDown, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// New Color Palette
const navbarColors = {
  primary: '#048181',      // Deep teal - primary accent
  secondary: '#f45c2c',    // Reddish-orange - secondary accent/CTA
  accent: '#5a9c7d',       // Sage green - secondary buttons
  dark: '#366854',         // Dark forest green - text
  highlight: '#ecca72',    // Pale gold - highlights
};

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
              className="text-gray-900 transition-colors"
              style={{ color: '#1E293B' }}
              onMouseEnter={(e) => e.currentTarget.style.color = navbarColors.primary}
              onMouseLeave={(e) => e.currentTarget.style.color = '#1E293B'}
            >
              Home
            </Link>
            <Link
              href="/"
              className="text-sm font-medium transition-colors flex items-center gap-1"
              style={{ color: '#1E293B' }}
              onMouseEnter={(e) => e.currentTarget.style.color = navbarColors.primary}
              onMouseLeave={(e) => e.currentTarget.style.color = '#1E293B'}
            >
              Category
              <ChevronDown className="w-4 h-4" />
            </Link>
            <Link
              href="/"
              className="text-gray-900 transition-colors"
              style={{ color: '#1E293B' }}
              onMouseEnter={(e) => e.currentTarget.style.color = navbarColors.primary}
              onMouseLeave={(e) => e.currentTarget.style.color = '#1E293B'}
            >
              Product
            </Link>
            <Link
              href="/instructors"
              className="text-gray-900 transition-colors"
              style={{ color: '#1E293B' }}
              onMouseEnter={(e) => e.currentTarget.style.color = navbarColors.primary}
              onMouseLeave={(e) => e.currentTarget.style.color = '#1E293B'}
            >
              Community
            </Link>
            <Link
              href="/instructors"
              className="text-gray-900 transition-colors"
              style={{ color: '#1E293B' }}
              onMouseEnter={(e) => e.currentTarget.style.color = navbarColors.primary}
              onMouseLeave={(e) => e.currentTarget.style.color = '#1E293B'}
            >
              Teach
            </Link>
          </div>

          {/* Right Side Actions */}
          <div className="navbar-right-actions flex items-center gap-1.5 sm:gap-2 md:gap-3 flex-shrink-0">
            <Link 
              href="/cart" 
              className="p-2 sm:p-2.5 rounded-lg hover:bg-gray-100 transition-colors relative flex-shrink-0"
              style={{ color: '#1E293B' }}
              onMouseEnter={(e) => e.currentTarget.style.color = navbarColors.primary}
              onMouseLeave={(e) => e.currentTarget.style.color = '#1E293B'}
            >
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard/my-courses"
                  className="px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 border border-gray-300 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-colors hover:bg-gray-50 hidden lg:block"
                  style={{ color: '#1E293B' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = navbarColors.primary;
                    e.currentTarget.style.borderColor = navbarColors.primary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#1E293B';
                    e.currentTarget.style.borderColor = '#D1D5DB';
                  }}
                >
                  My Learning
                </Link>
                <motion.button
                  onClick={logout}
                  className="text-white px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-300 shadow-lg hidden lg:block"
                  style={{ backgroundColor: navbarColors.primary, boxShadow: `0 10px 15px -3px ${navbarColors.primary}20` }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = navbarColors.secondary}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = navbarColors.primary}
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
                  className="px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 border border-gray-300 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-colors hover:bg-gray-50 hidden lg:block"
                  style={{ color: '#1E293B' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = navbarColors.primary;
                    e.currentTarget.style.borderColor = navbarColors.primary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#1E293B';
                    e.currentTarget.style.borderColor = '#D1D5DB';
                  }}
                >
                  Login
                </Link>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="hidden lg:block">
                  <Link
                    href="/register"
                    className="text-white px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-300 shadow-lg inline-block"
                    style={{ backgroundColor: navbarColors.primary, boxShadow: `0 10px 15px -3px ${navbarColors.primary}20` }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = navbarColors.secondary}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = navbarColors.primary}
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
                <Link 
                  href="/" 
                  className="px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  style={{ color: '#1E293B' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = navbarColors.primary}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#1E293B'}
                >
                  Home
                </Link>
                <Link 
                  href="/" 
                  className="px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  style={{ color: '#1E293B' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = navbarColors.primary}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#1E293B'}
                >
                  Category
                </Link>
                <Link 
                  href="/" 
                  className="px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  style={{ color: '#1E293B' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = navbarColors.primary}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#1E293B'}
                >
                  Product
                </Link>
                <Link 
                  href="/instructors" 
                  className="px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  style={{ color: '#1E293B' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = navbarColors.primary}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#1E293B'}
                >
                  Community
                </Link>
                <Link 
                  href="/instructors" 
                  className="px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  style={{ color: '#1E293B' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = navbarColors.primary}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#1E293B'}
                >
                  Teach
                </Link>
                {isAuthenticated ? (
                  <>
                    <Link 
                      href="/dashboard/my-courses" 
                      className="px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                      style={{ color: '#1E293B' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = navbarColors.primary}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#1E293B'}
                    >
                      My Learning
                    </Link>
                    <button 
                      onClick={logout} 
                      className="text-left px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                      style={{ color: '#1E293B' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = navbarColors.primary}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#1E293B'}
                    >
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <Link 
                      href="/login" 
                      className="px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                      style={{ color: '#1E293B' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = navbarColors.primary}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#1E293B'}
                    >
                      Login
                    </Link>
                    <Link 
                      href="/register" 
                      className="px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                      style={{ color: '#1E293B' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = navbarColors.primary}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#1E293B'}
                    >
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
