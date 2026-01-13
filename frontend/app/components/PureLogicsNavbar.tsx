'use client';

import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { coursesAPI } from '@/lib/api';
import { Search, ShoppingCart, ChevronDown, Menu, X, BookOpen } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface CourseSuggestion {
  id: number;
  title: string;
  slug: string;
  instructor_name: string;
  thumbnail?: string;
}

export default function PureLogicsNavbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<CourseSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showSuggestions && searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showSuggestions]);

  // Debounced search for suggestions
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim().length >= 2) {
      setIsSearching(true);
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const response = await coursesAPI.getAll({ search: searchQuery.trim(), page_size: 5 });
          let coursesData: CourseSuggestion[] = [];
          if (response.data) {
            if (response.data.results && Array.isArray(response.data.results)) {
              coursesData = response.data.results.map((course: any) => ({
                id: course.id,
                title: course.title,
                slug: course.slug,
                instructor_name: course.instructor_name || 'Unknown',
                thumbnail: course.thumbnail,
              }));
            } else if (Array.isArray(response.data)) {
              coursesData = response.data.slice(0, 5).map((course: any) => ({
                id: course.id,
                title: course.title,
                slug: course.slug,
                instructor_name: course.instructor_name || 'Unknown',
                thumbnail: course.thumbnail,
              }));
            }
          }
          setSearchSuggestions(coursesData);
          setShowSuggestions(coursesData.length > 0);
          setIsSearching(false);
        } catch (error) {
          console.error('Error fetching search suggestions:', error);
          setSearchSuggestions([]);
          setShowSuggestions(false);
          setIsSearching(false);
        }
      }, 300);
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      setIsSearching(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0F172A]/95 backdrop-blur-xl border-b border-[#334155] shadow-lg">
      <div className="max-w-[1400px] xl:max-w-[1600px] 2xl:max-w-[1800px] mx-auto w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
        <div className="flex items-center justify-between h-20 gap-4 w-full">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0 group">
            <motion.div
              className="w-10 h-10 bg-[#10B981] rounded-xl flex items-center justify-center shadow-lg shadow-[#10B981]/30"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-5 h-5 bg-[#0F172A] rounded-lg"></div>
            </motion.div>
            <span className="text-xl font-black text-white">
              Pure<span className="text-[#10B981]">Logics</span>
            </span>
          </Link>

          {/* Explore Link */}
          <Link
            href="/courses"
            className="text-[#D1D5DB] px-4 py-2 hover:bg-[#1E293B] rounded-lg flex items-center gap-2 text-sm font-medium transition-colors hidden md:flex"
          >
            Explore
            <ChevronDown className="w-4 h-4" />
          </Link>

          {/* Search Bar with Predictive Search */}
          <div ref={searchContainerRef} className="flex-1 max-w-2xl mx-4 hidden md:block relative">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  setShowSuggestions(false);
                  router.push(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
                }
              }}
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#9CA3AF] w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search for anything"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (e.target.value.trim().length >= 2) {
                      setShowSuggestions(true);
                    }
                  }}
                  onFocus={() => {
                    if (searchSuggestions.length > 0) {
                      setShowSuggestions(true);
                    }
                  }}
                  className="w-full pl-11 pr-4 py-3 bg-[#1E293B] border border-[#334155] rounded-full text-white placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all text-sm"
                />
                {isSearching && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-[#10B981] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
            </form>

            {/* Search Suggestions Dropdown */}
            <AnimatePresence>
              {showSuggestions && searchSuggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-[#1E293B] rounded-xl shadow-2xl z-50 border border-[#334155] max-h-96 overflow-y-auto"
                >
                  <div className="py-2">
                    {searchSuggestions.map((course) => (
                      <Link
                        key={course.id}
                        href={`/courses/${course.slug}`}
                        onClick={() => {
                          setShowSuggestions(false);
                          setSearchQuery('');
                        }}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-[#334155] transition-colors group"
                      >
                        <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-[#10B981] flex items-center justify-center">
                          {course.thumbnail ? (
                            <img
                              src={course.thumbnail}
                              alt={course.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <BookOpen className="w-6 h-6 text-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold text-sm group-hover:text-[#10B981] transition-colors truncate">
                            {course.title}
                          </p>
                          <p className="text-[#9CA3AF] text-xs truncate">
                            {course.instructor_name}
                          </p>
                        </div>
                        <Search className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#10B981] transition-colors flex-shrink-0" />
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

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
            {/* Globe button removed - no functionality implemented */}
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
                  className="bg-[#10B981] hover:bg-[#10B981] text-white px-5 py-2.5 rounded-lg text-sm font-bold whitespace-nowrap transition-all duration-300 shadow-lg shadow-[#10B981]/20"
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
                    className="bg-[#10B981] hover:bg-[#10B981] text-white px-5 py-2.5 rounded-lg text-sm font-bold whitespace-nowrap transition-all duration-300 shadow-lg shadow-[#10B981]/20 inline-block"
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
