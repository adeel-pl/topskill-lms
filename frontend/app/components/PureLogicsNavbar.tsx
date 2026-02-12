'use client';

import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { ShoppingCart, ChevronDown, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { colors } from '@/lib/colors';

export default function PureLogicsNavbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm" style={{ borderBottomColor: colors.border.primary, borderBottomWidth: '1px', borderBottomStyle: 'solid' }}>
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
              style={{ color: colors.text.dark }}
              onMouseEnter={(e) => e.currentTarget.style.color = colors.primary}
              onMouseLeave={(e) => e.currentTarget.style.color = colors.text.dark}
            >
              Course
            </Link>
            <Link
              href="/"
              className="text-gray-900 transition-colors"
              style={{ color: colors.text.dark }}
              onMouseEnter={(e) => e.currentTarget.style.color = colors.primary}
              onMouseLeave={(e) => e.currentTarget.style.color = colors.text.dark}
            >
              About
            </Link>
            <Link
              href="/instructors"
              className="text-gray-900 transition-colors"
              style={{ color: colors.text.dark }}
              onMouseEnter={(e) => e.currentTarget.style.color = colors.primary}
              onMouseLeave={(e) => e.currentTarget.style.color = colors.text.dark}
            >
              Instructor
            </Link>
            <Link
              href="/"
              className="text-gray-900 transition-colors"
              style={{ color: colors.text.dark }}
              onMouseEnter={(e) => e.currentTarget.style.color = colors.primary}
              onMouseLeave={(e) => e.currentTarget.style.color = colors.text.dark}
            >
              Contact
            </Link>
          </div>

          {/* Right Side Actions */}
          <div className="navbar-right-actions flex items-center gap-1.5 sm:gap-2 md:gap-3 flex-shrink-0">
            <Link 
              href="/cart" 
              className="p-2 sm:p-2.5 rounded-lg transition-colors relative flex-shrink-0"
              style={{ color: colors.text.dark }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.background.soft;
                e.currentTarget.style.color = colors.primary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = colors.text.dark;
              }}
            >
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard/my-courses"
                  className="px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-colors hidden lg:block"
                  style={{ borderColor: colors.border.primary, borderWidth: '1px', borderStyle: 'solid', color: '#1E293B' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.background.soft;
                    e.currentTarget.style.color = colors.primary;
                    e.currentTarget.style.borderColor = colors.primary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = colors.text.dark;
                    e.currentTarget.style.borderColor = colors.border.primary;
                  }}
                >
                  My Courses
                </Link>
                <motion.button
                  onClick={logout}
                  className="text-white px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-300 shadow-lg hidden lg:block"
                  style={{ backgroundColor: colors.primary, boxShadow: `0 10px 15px -3px ${colors.primary}20` }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.secondary}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.primary}
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
                  className="px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-colors hidden lg:block"
                  style={{ borderColor: colors.border.primary, borderWidth: '1px', borderStyle: 'solid', color: '#1E293B' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.background.soft;
                    e.currentTarget.style.color = colors.primary;
                    e.currentTarget.style.borderColor = colors.primary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = colors.text.dark;
                    e.currentTarget.style.borderColor = colors.border.primary;
                  }}
                >
                  Login
                </Link>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="hidden lg:block">
                  <Link
                    href="/register"
                    className="text-white px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-300 shadow-lg inline-block"
                    style={{ backgroundColor: colors.primary, boxShadow: `0 10px 15px -3px ${colors.primary}20` }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.secondary}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.primary}
                  >
                    Sign up
                  </Link>
                </motion.div>
              </>
            )}
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="mobile-menu-toggle block p-2 rounded-lg transition-colors flex-shrink-0 lg:hidden"
              style={{ color: colors.text.dark }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.background.soft}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
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
              className="lg:hidden py-4 overflow-hidden bg-white"
              style={{ borderTopColor: colors.border.primary, borderTopWidth: '1px', borderTopStyle: 'solid' }}
            >
              <div className="flex flex-col gap-2">
                <Link 
                  href="/" 
                  className="px-4 py-2 rounded-lg transition-colors text-sm"
                  style={{ color: '#1E293B' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.background.soft;
                    e.currentTarget.style.color = colors.primary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#1E293B';
                  }}
                >
                  Home
                </Link>
                <Link 
                  href="/" 
                  className="px-4 py-2 rounded-lg transition-colors text-sm"
                  style={{ color: '#1E293B' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.background.soft;
                    e.currentTarget.style.color = colors.primary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#1E293B';
                  }}
                >
                  Category
                </Link>
                <Link 
                  href="/" 
                  className="px-4 py-2 rounded-lg transition-colors text-sm"
                  style={{ color: '#1E293B' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.background.soft;
                    e.currentTarget.style.color = colors.primary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#1E293B';
                  }}
                >
                  Product
                </Link>
                <Link 
                  href="/instructors" 
                  className="px-4 py-2 rounded-lg transition-colors text-sm"
                  style={{ color: '#1E293B' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.background.soft;
                    e.currentTarget.style.color = colors.primary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#1E293B';
                  }}
                >
                  Community
                </Link>
                <Link 
                  href="/instructors" 
                  className="px-4 py-2 rounded-lg transition-colors text-sm"
                  style={{ color: '#1E293B' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.background.soft;
                    e.currentTarget.style.color = colors.primary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#1E293B';
                  }}
                >
                  Instructors
                </Link>
                {isAuthenticated ? (
                  <>
                    <Link 
                      href="/dashboard/my-courses" 
                      className="px-4 py-2 rounded-lg transition-colors text-sm"
                      style={{ color: '#1E293B' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = colors.background.soft;
                        e.currentTarget.style.color = colors.primary;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#1E293B';
                      }}
                    >
                      My Courses
                    </Link>
                    <button 
                      onClick={logout} 
                      className="text-left px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                      style={{ color: '#1E293B' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = colors.primary}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#1E293B'}
                    >
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <Link 
                      href="/login" 
                      className="px-4 py-2 rounded-lg transition-colors text-sm"
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.background.soft}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      style={{ color: '#1E293B' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = colors.primary}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#1E293B'}
                    >
                      Login
                    </Link>
                    <Link 
                      href="/register" 
                      className="px-4 py-2 rounded-lg transition-colors text-sm"
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.background.soft}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      style={{ color: '#1E293B' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = colors.primary}
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

