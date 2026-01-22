'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { coursesAPI } from '@/lib/api';
import { Search, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// New Color Palette for Search Results
const searchColors = {
  primary: '#048181',      // Deep teal - primary accent
  secondary: '#f45c2c',    // Reddish-orange - secondary accent/CTA
  accent: '#5a9c7d',       // Sage green - secondary buttons
  dark: '#366854',         // Dark forest green - text
  light: '#9fbeb2',        // Pale mint - light background
  highlight: '#ecca72',    // Pale gold - highlights
  white: '#FFFFFF',
  textDark: '#1E293B',
  textMuted: '#64748B',
  background: '#FFFFFF',
  backgroundHover: '#f8f9fa',
};

interface CourseSuggestion {
  id: number;
  title: string;
  slug: string;
  instructor_name: string;
  thumbnail?: string;
}

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  variant?: 'header' | 'hero';
}

export default function SearchBar({ 
  placeholder = "Search for anything",
  className = "",
  variant = 'header'
}: SearchBarProps) {
  const router = useRouter();
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

    if (searchQuery.trim().length >= 1) {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      router.push(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Hero variant styling
  if (variant === 'hero') {
    return (
      <div ref={searchContainerRef} className={`relative w-full max-w-2xl ${className}`}>
        <form onSubmit={handleSubmit}>
          <div className="relative">
            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-white w-6 h-6" />
            <input
              type="text"
              placeholder={placeholder}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value.trim().length >= 2) {
                  setShowSuggestions(true);
                }
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = searchColors.highlight;
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                if (searchSuggestions.length > 0) {
                  setShowSuggestions(true);
                }
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              }}
              className="w-full pl-14 pr-6 py-4 md:py-5 rounded-xl focus:outline-none focus:ring-2 transition-all text-base md:text-lg bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white placeholder-white/70"
              style={{ '--tw-ring-color': searchColors.highlight } as React.CSSProperties}
            />
            {isSearching && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: searchColors.highlight }}></div>
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
              className="absolute top-full left-0 right-0 mt-2 rounded-xl shadow-2xl z-50 border max-h-96 overflow-y-auto"
              style={{ backgroundColor: searchColors.background, borderColor: searchColors.light }}
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
                    className="flex items-center gap-3 px-4 py-3 transition-colors group"
                    style={{ backgroundColor: 'transparent' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = searchColors.backgroundHover}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center" style={{ backgroundColor: searchColors.primary }}>
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
                      <p className="font-semibold text-sm transition-colors truncate" style={{ color: searchColors.dark }} onMouseEnter={(e) => e.currentTarget.style.color = searchColors.primary} onMouseLeave={(e) => e.currentTarget.style.color = searchColors.dark}>
                        {course.title}
                      </p>
                      <p className="text-xs truncate" style={{ color: searchColors.textMuted }}>
                        {course.instructor_name}
                      </p>
                    </div>
                    <Search className="w-4 h-4 transition-colors flex-shrink-0" style={{ color: searchColors.textMuted }} onMouseEnter={(e) => e.currentTarget.style.color = searchColors.primary} onMouseLeave={(e) => e.currentTarget.style.color = searchColors.textMuted} />
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Header variant styling (default)
  return (
    <div ref={searchContainerRef} className={`flex-1 max-w-2xl mx-2 sm:mx-3 md:mx-4 hidden lg:block relative min-w-0 ${className}`}>
      <style jsx>{`
        input::placeholder {
          color: ${searchColors.textMuted} !important;
        }
      `}</style>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: searchColors.textMuted }} />
          <input
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (e.target.value.trim().length >= 2) {
                setShowSuggestions(true);
              }
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = searchColors.primary;
              e.currentTarget.style.boxShadow = `0 0 0 2px ${searchColors.primary}30`;
              if (searchSuggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = searchColors.light;
              e.currentTarget.style.boxShadow = '';
            }}
            className="w-full pl-11 pr-4 py-3 rounded-full focus:outline-none transition-all text-sm"
            style={{ 
              backgroundColor: searchColors.background,
              borderColor: searchColors.light,
              borderWidth: '1px',
              borderStyle: 'solid',
              color: searchColors.dark,
            }}
          />
          {isSearching && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: searchColors.primary }}></div>
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
            className="absolute top-full left-0 right-0 mt-2 rounded-xl shadow-2xl z-50 border max-h-96 overflow-y-auto"
            style={{ backgroundColor: searchColors.background, borderColor: searchColors.light }}
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
                  className="flex items-center gap-3 px-4 py-3 transition-colors group"
                  style={{ backgroundColor: 'transparent' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = searchColors.backgroundHover}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center" style={{ backgroundColor: searchColors.primary }}>
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
                    <p className="font-semibold text-sm transition-colors truncate" style={{ color: searchColors.dark }} onMouseEnter={(e) => e.currentTarget.style.color = searchColors.primary} onMouseLeave={(e) => e.currentTarget.style.color = searchColors.dark}>
                      {course.title}
                    </p>
                    <p className="text-xs truncate" style={{ color: searchColors.textMuted }}>
                      {course.instructor_name}
                    </p>
                  </div>
                  <Search className="w-4 h-4 transition-colors flex-shrink-0" style={{ color: searchColors.textMuted }} onMouseEnter={(e) => e.currentTarget.style.color = searchColors.primary} onMouseLeave={(e) => e.currentTarget.style.color = searchColors.textMuted} />
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

