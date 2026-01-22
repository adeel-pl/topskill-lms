'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { coursesAPI } from '@/lib/api';
import PureLogicsNavbar from '@/app/components/PureLogicsNavbar';
import SearchBar from '@/app/components/SearchBar';
import CourseCard from '@/app/components/CourseCard';
import CompactCourseCard from '@/app/components/CompactCourseCard';
import Footer from '@/app/components/Footer';
import { ArrowRight, Grid3x3, List, Star, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { colors } from '@/lib/colors';

interface Course {
  id: number;
  title: string;
  slug: string;
  description: string;
  short_description?: string;
  price: number;
  thumbnail: string;
  instructor_name: string;
  enrolled_count: number;
  average_rating: number;
  rating_count?: number;
  modality: string;
  total_duration_hours?: number;
  total_lectures?: number;
}

// Using centralized color system from @/lib/colors
// All colors are now managed in one place for easy updates

// Certification logos data - Using actual URLs from topskills.pk (from network requests)
const certificationLogos = [
  { 
    name: 'Logo 1', 
    url: 'https://topskills.pk/wp-content/uploads/2024/08/Group-40489.png'
  },
  { 
    name: 'Logo 2', 
    url: 'https://topskills.pk/wp-content/uploads/2024/08/Group-40491.png'
  },
  { 
    name: 'Logo 3', 
    url: 'https://topskills.pk/wp-content/uploads/2024/08/Group-40492.png'
  },
  { 
    name: 'Logo 4', 
    url: 'https://topskills.pk/wp-content/uploads/2024/08/Group-40493.png'
  },
  { 
    name: 'Logo 5', 
    url: 'https://topskills.pk/wp-content/uploads/2024/08/Group-40495.png'
  },
  { 
    name: 'Logo 6', 
    url: 'https://topskills.pk/wp-content/uploads/2024/08/Group-40496.png'
  },
  { 
    name: 'Logo 7', 
    url: 'https://topskills.pk/wp-content/uploads/2024/08/Group-5-200x85.png'
  },
];

export default function HomePage() {
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [displayedTrendingCourses, setDisplayedTrendingCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'online' | 'physical'>('online');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);
  const coursesPerPage = 8; // Load 8 courses at a time for trending section

  useEffect(() => {
    loadAllCourses();
  }, []);

  const loadAllCourses = async () => {
    try {
      console.log('Loading all courses...');
      // Load all courses - use a large page_size or fetch all pages
      let allCoursesData: Course[] = [];
      let page = 1;
      let hasMorePages = true;

      while (hasMorePages) {
        const response = await coursesAPI.getAll({ page_size: 100, page });
        console.log(`Page ${page} Response:`, response);
        
        let pageCourses: Course[] = [];
        if (response.data) {
          if (response.data.results && Array.isArray(response.data.results)) {
            pageCourses = response.data.results;
            // Check if there are more pages
            hasMorePages = response.data.next !== null && response.data.next !== undefined;
          } else if (Array.isArray(response.data)) {
            pageCourses = response.data;
            hasMorePages = false; // If it's a direct array, no pagination
          }
        }
        
        allCoursesData = [...allCoursesData, ...pageCourses];
        
        // If we got less than page_size, we're done
        if (pageCourses.length < 100) {
          hasMorePages = false;
        } else {
          page++;
        }
      }
      
      console.log('All courses loaded:', allCoursesData.length);
      setAllCourses(allCoursesData);
      
      // Set initial trending courses based on active tab
      updateTrendingCourses(allCoursesData, activeTab, true);
      setLoading(false);
    } catch (error: any) {
      console.error('Error loading courses:', error);
      setAllCourses([]);
      setDisplayedTrendingCourses([]);
      setLoading(false);
    }
  };

  // Filter courses by modality
  const getFilteredCourses = (courses: Course[], tab: 'online' | 'physical') => {
    return tab === 'online' 
      ? courses.filter((c: Course) => c.modality === 'online' || !c.modality)
      : courses.filter((c: Course) => c.modality === 'physical' || c.modality === 'hybrid');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Update trending courses when tab changes or on initial load
  const updateTrendingCourses = useCallback((courses: Course[], tab: 'online' | 'physical', reset: boolean = false) => {
    const filtered = getFilteredCourses(courses, tab);
    if (reset) {
      setDisplayedTrendingCourses(filtered.slice(0, coursesPerPage));
      setHasMore(filtered.length > coursesPerPage);
    } else {
      setDisplayedTrendingCourses(prev => {
        const currentLength = prev.length;
        const nextBatch = filtered.slice(currentLength, currentLength + coursesPerPage);
        if (nextBatch.length > 0) {
          const newList = [...prev, ...nextBatch];
          setHasMore(newList.length < filtered.length);
          return newList;
        } else {
          setHasMore(false);
          return prev;
        }
      });
    }
  }, [coursesPerPage]);

  // Handle tab change
  useEffect(() => {
    if (allCourses.length > 0) {
      updateTrendingCourses(allCourses, activeTab, true);
    }
  }, [activeTab, allCourses, updateTrendingCourses]);

  const loadMoreTrendingCourses = useCallback(() => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    setTimeout(() => {
      updateTrendingCourses(allCourses, activeTab, false);
      setLoadingMore(false);
    }, 300);
  }, [allCourses, activeTab, loadingMore, hasMore, updateTrendingCourses]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMoreTrendingCourses();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [loadMoreTrendingCourses, hasMore, loadingMore]);


  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: colors.text.white, color: colors.text.dark }}>
      <PureLogicsNavbar />

      {/* Hero Section - New Color Palette Background with WOW Effects */}
      <section className="section-after-header relative pb-16 md:pb-20 lg:pb-24 overflow-hidden" style={{ backgroundColor: colors.accent.primary }}>
        {/* Animated Floating Orbs/Background Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute rounded-full opacity-20 blur-3xl"
            style={{ 
              width: '400px', 
              height: '400px',
              background: `radial-gradient(circle, ${colors.accent.highlight} 0%, transparent 70%)`,
              top: '10%',
              left: '10%',
            }}
            animate={{
              x: [0, 100, 0],
              y: [0, 50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute rounded-full opacity-15 blur-3xl"
            style={{ 
              width: '300px', 
              height: '300px',
              background: `radial-gradient(circle, ${colors.accent.secondary} 0%, transparent 70%)`,
              bottom: '20%',
              right: '15%',
            }}
            animate={{
              x: [0, -80, 0],
              y: [0, -60, 0],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute rounded-full opacity-10 blur-2xl"
            style={{ 
              width: '250px', 
              height: '250px',
              background: `radial-gradient(circle, ${colors.accent.accent} 0%, transparent 70%)`,
              top: '50%',
              right: '30%',
            }}
            animate={{
              x: [0, 60, 0],
              y: [0, -40, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
        
        <div className="max-w-[1400px] xl:max-w-[1600px] 2xl:max-w-[1800px] mx-auto w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[600px] lg:min-h-[700px]">
            {/* Left Side - Text Content */}
            <div className="flex flex-col justify-center">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-4 md:mb-6 leading-tight relative"
                style={{ color: '#FFFFFF' }}
              >
                <span className="relative inline-block">
                  New to{' '}
                  <span style={{ color: colors.accent.highlight }}>
                    TopSkill?
                  </span>
                </span>
                <br />
                <motion.span
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                >
                  You are lucky.
                </motion.span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg md:text-xl lg:text-2xl mb-8 md:mb-10 leading-relaxed"
                style={{ color: '#FFFFFF' }}
              >
                Let us help you ensure you get an unmatched experience combined with results worth.
              </motion.p>
              
              {/* Search Bar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="w-full max-w-2xl"
              >
                <SearchBar 
                  variant="hero"
                  placeholder="Search courses by title, instructor, or topic..."
                />
              </motion.div>

              {/* Statistics with WOW Effects */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="flex flex-wrap gap-6 md:gap-8 lg:gap-12 mt-8 md:mt-12"
              >
                <motion.div 
                  className="flex flex-col relative group"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="absolute -inset-2 bg-white/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative backdrop-blur-sm bg-white/5 rounded-xl px-6 py-4 border border-white/10">
                    <motion.div 
                      className="text-3xl md:text-4xl lg:text-5xl font-black mb-1"
                      style={{ color: colors.accent.highlight }}
                      animate={{
                        scale: [1, 1.05, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      10M
                    </motion.div>
                    <div className="text-sm md:text-base text-white/80">HAPPY CUSTOMER</div>
                  </div>
                </motion.div>
                <div className="hidden sm:block w-px bg-white/30"></div>
                <motion.div 
                  className="flex flex-col relative group"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="absolute -inset-2 bg-white/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative backdrop-blur-sm bg-white/5 rounded-xl px-6 py-4 border border-white/10">
                    <motion.div 
                      className="text-3xl md:text-4xl lg:text-5xl font-black mb-1"
                      style={{ color: colors.accent.secondary }}
                      animate={{
                        scale: [1, 1.05, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.3
                      }}
                    >
                      25K
                    </motion.div>
                    <div className="text-sm md:text-base text-white/80">POPULAR COURSE</div>
                  </div>
                </motion.div>
                <div className="hidden sm:block w-px bg-white/30"></div>
                <motion.div 
                  className="flex flex-col relative group"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="absolute -inset-2 bg-white/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative backdrop-blur-sm bg-white/5 rounded-xl px-6 py-4 border border-white/10">
                    <motion.div 
                      className="text-3xl md:text-4xl lg:text-5xl font-black mb-1"
                      style={{ color: colors.accent.accent }}
                      animate={{
                        scale: [1, 1.05, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.6
                      }}
                    >
                      10+
                    </motion.div>
                    <div className="text-sm md:text-base text-white/80">YEARS EXPERIENCES</div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Certification Logos - Rotating Carousel */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="mt-8 md:mt-12 w-full"
              >
                <div className="text-center mb-4 md:mb-6">
                  <h3 className="text-lg md:text-xl font-semibold text-white/90 whitespace-nowrap">
                    Our Experienced Trainers are <span className="font-bold" style={{ color: colors.accent.highlight }}>Certified from</span>
                  </h3>
                </div>
                
                {/* Logos Carousel */}
                <div className="relative overflow-hidden rounded-xl py-4 w-full">
                  <div className="flex items-center gap-4 md:gap-6 lg:gap-8 animate-scroll-hero">
                    {/* Render logos 3 times for seamless infinite loop */}
                    {/* When animation moves by 33.33% (one set), it resets seamlessly */}
                    {[...certificationLogos, ...certificationLogos, ...certificationLogos].map((logo, index) => (
                      <div key={`${logo.name}-${index}`} className="flex-shrink-0 flex items-center justify-center h-12 md:h-16 w-24 md:w-32">
                        <img 
                          src={logo.url} 
                          alt={logo.name} 
                          className="h-full w-auto max-w-full object-contain opacity-100"
                          loading="eager"
                          onError={(e) => {
                            console.error(`Failed to load logo: ${logo.name} from ${logo.url}`);
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Side - Image/Illustration */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative hidden lg:flex items-center justify-center"
            >
              <div className="relative w-full max-w-lg">
                {/* Decorative shapes */}
                <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl" style={{ backgroundColor: `${colors.accent.highlight}30` }}></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full blur-3xl" style={{ backgroundColor: `${colors.accent.secondary}30` }}></div>
                
                {/* Main illustration area with Glassmorphism */}
                <motion.div 
                  className="relative backdrop-blur-xl rounded-3xl p-8 border-2"
                  style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    boxShadow: `0 8px 32px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.1) inset`
                  }}
                  whileHover={{ 
                    scale: 1.02,
                    boxShadow: `0 20px 60px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.2) inset`
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <motion.div 
                    className="rounded-2xl overflow-hidden relative"
                    style={{ 
                      backgroundColor: 'transparent',
                    }}
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    {/* Homepage Image */}
                    <motion.img
                      src="https://topskills.pk/wp-content/uploads/2023/05/Homepage-Image-1-725x536.png"
                      alt="TopSkill Learning Platform"
                      className="w-full h-auto object-contain"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.8, delay: 0.5 }}
                      whileHover={{ scale: 1.05 }}
                    />
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes scroll-hero {
          0% {
            transform: translateX(0);
          }
          100% {
            /* Move by exactly 33.33% (one full set since we have 3 identical sets) */
            /* When animation resets to 0%, it's seamless because set 2 looks identical to set 1 */
            transform: translateX(calc(-100% / 3));
          }
        }
        .animate-scroll-hero {
          display: flex;
          width: max-content;
          animation: scroll-hero 35s linear infinite;
          will-change: transform;
        }
        .animate-scroll-hero:hover {
          animation-play-state: paused;
        }
        
      `}</style>

      {/* Trending Courses Section with Tabs - Enhanced with WOW */}
      <section 
        className="pt-20 pb-0 relative overflow-hidden" 
        style={{ backgroundColor: colors.text.white }}
      >
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-3" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, ${colors.accent.primary} 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
        <div className="max-w-container xl:max-w-container-xl 2xl:max-w-container-2xl mx-auto w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
          <div className="mb-12">
            {/* Header with Title and View Toggle */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
              <div className="text-center md:text-left">
                <motion.h2 
                  className="text-4xl md:text-5xl font-black mb-4 relative inline-block"
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  style={{ color: colors.text.dark }}
                >
                  Trending Courses
                </motion.h2>
                <motion.p 
                  className="text-xl max-w-3xl"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                  style={{ color: colors.text.dark }}
                >
                  Discover the most popular courses loved by thousands of learners
                </motion.p>
              </div>
              
              {/* View Toggle Buttons - Positioned on the right */}
              <div className="flex items-center justify-center md:justify-end">
                <div className="flex items-center gap-1 bg-white rounded-xl px-1 py-1 shadow-md border" style={{ borderColor: colors.accent.accent + '40' }}>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2.5 md:p-3 rounded-lg transition-all duration-300 ${
                      viewMode === 'grid' 
                        ? 'shadow-sm' 
                        : 'hover:bg-gray-50'
                    }`}
                    style={{
                      backgroundColor: viewMode === 'grid' ? colors.accent.primary : 'transparent',
                      color: viewMode === 'grid' ? colors.text.white : colors.text.muted,
                    }}
                    title="Grid View"
                  >
                    <Grid3x3 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2.5 md:p-3 rounded-lg transition-all duration-300 ${
                      viewMode === 'list' 
                        ? 'shadow-sm' 
                        : 'hover:bg-gray-50'
                    }`}
                    style={{
                      backgroundColor: viewMode === 'list' ? colors.accent.primary : 'transparent',
                      color: viewMode === 'list' ? colors.text.white : colors.text.muted,
                    }}
                    title="List View"
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Tab Buttons with WOW Effects */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <motion.button
                onClick={() => setActiveTab('online')}
                className="px-6 py-3 rounded-xl font-semibold text-base md:text-lg relative overflow-hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  backgroundColor: activeTab === 'online' ? colors.accent.primary : colors.text.white,
                  color: activeTab === 'online' ? colors.text.white : colors.text.dark,
                  borderWidth: activeTab === 'online' ? '0' : '2px',
                  borderStyle: 'solid',
                  borderColor: colors.accent.primary,
                  boxShadow: activeTab === 'online' ? `0 10px 25px -5px ${colors.accent.primary}40` : 'none',
                }}
              >
                {activeTab === 'online' && (
                  <motion.div
                    className="absolute inset-0"
                    style={{
                      backgroundColor: colors.accent.primary,
                    }}
                    layoutId="activeTab"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative z-10">Online Courses</span>
              </motion.button>
              <motion.button
                onClick={() => setActiveTab('physical')}
                className="px-6 py-3 rounded-xl font-semibold text-base md:text-lg relative overflow-hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  backgroundColor: activeTab === 'physical' ? colors.accent.primary : colors.text.white,
                  color: activeTab === 'physical' ? colors.text.white : colors.text.dark,
                  borderWidth: activeTab === 'physical' ? '0' : '2px',
                  borderStyle: 'solid',
                  borderColor: colors.accent.primary,
                  boxShadow: activeTab === 'physical' ? `0 10px 25px -5px ${colors.accent.primary}40` : 'none',
                }}
              >
                {activeTab === 'physical' && (
                  <motion.div
                    className="absolute inset-0"
                    style={{
                      backgroundColor: colors.accent.primary,
                    }}
                    layoutId="activeTab"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative z-10">Physical Courses</span>
              </motion.button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div 
                className="w-16 h-16 border-4 rounded-full animate-spin mx-auto mb-4"
                style={{ borderColor: colors.background.light, borderTopColor: colors.accent.primary }}
              ></div>
              <p className="text-lg" style={{ color: colors.text.dark }}>Loading courses...</p>
            </div>
          ) : displayedTrendingCourses.length === 0 ? (
            <div className="text-center py-20 text-lg" style={{ color: colors.text.dark }}>
              No {activeTab === 'online' ? 'online' : 'physical'} courses available
            </div>
          ) : viewMode === 'grid' ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {displayedTrendingCourses.map((course, index) => (
                  <CompactCourseCard key={course.id} course={course} index={index} />
                ))}
              </div>
              
              {/* Infinite Scroll Trigger */}
              <div ref={observerTarget} className="h-10 flex items-center justify-center mt-8">
                {loadingMore && (
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-6 h-6 border-2 rounded-full animate-spin"
                      style={{ borderColor: colors.background.light, borderTopColor: colors.accent.primary }}
                    ></div>
                    <p className="text-sm" style={{ color: colors.text.dark }}>Loading more courses...</p>
                  </div>
                )}
                {!hasMore && displayedTrendingCourses.length > 0 && (
                  <p className="text-sm mb-8" style={{ color: colors.accent.primary }}>No more courses to load</p>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="space-y-3 md:space-y-4 lg:space-y-6">
                {displayedTrendingCourses.map((course, index) => (
                  <Link
                    key={course.id}
                    href={`/courses/${course.slug}`}
                    className="block group"
                  >
                    <div className="bg-white border rounded-2xl p-4 md:p-5 lg:p-6 shadow-sm hover:shadow-lg transition-all duration-500 hover:scale-[1.01] hover:-translate-y-1" style={{ borderColor: colors.background.light }}>
                      <div className="flex items-start gap-4 md:gap-5 lg:gap-6">
                        <div className="relative w-28 md:w-40 lg:w-48 h-20 md:h-28 lg:h-32 rounded-xl overflow-hidden flex-shrink-0" style={{ backgroundColor: colors.accent.primary }}>
                          {course.thumbnail ? (
                            <img
                              src={course.thumbnail}
                              alt={course.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-white text-2xl md:text-3xl lg:text-4xl font-black">{course.title.charAt(0)}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg md:text-xl lg:text-2xl font-black mb-1.5 md:mb-2 transition-colors" style={{ color: colors.text.dark }}>
                            {course.title}
                          </h3>
                          <p className="mb-2 md:mb-3 line-clamp-2 text-sm md:text-base" style={{ color: colors.text.muted }}>{course.description}</p>
                          <p className="text-xs md:text-sm font-semibold mb-3 md:mb-4" style={{ color: colors.accent.primary }}>{course.instructor_name}</p>
                          <div className="flex items-center gap-3 md:gap-4 lg:gap-6 text-xs md:text-sm flex-wrap">
                            {course.average_rating > 0 ? (
                              <div className="flex items-center gap-1 md:gap-1.5">
                                <Star className="w-4 h-4" style={{ color: colors.accent.secondary, fill: colors.accent.secondary }} />
                                <span className="font-bold" style={{ color: colors.text.dark }}>{course.average_rating.toFixed(1)}</span>
                                {course.rating_count && (
                                  <span style={{ color: colors.text.muted }}>({course.rating_count})</span>
                                )}
                              </div>
                            ) : (
                              <span style={{ color: colors.text.muted }}>No ratings yet</span>
                            )}
                            <div className="flex items-center gap-1 md:gap-1.5" style={{ color: colors.text.muted }}>
                              <Users className="w-4 h-4" />
                              <span>{course.enrolled_count || 0} students</span>
                            </div>
                            <span className="text-lg md:text-xl lg:text-2xl font-black" style={{ color: colors.accent.primary }}>{formatPrice(course.price)}</span>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <span className="px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-xs font-black text-white border" style={{ 
                            backgroundColor: course.modality === 'online' ? colors.accent.primary : colors.accent.accent,
                            borderColor: course.modality === 'online' ? colors.accent.primary : colors.accent.accent
                          }}>
                            {course.modality.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              
              {/* Infinite Scroll Trigger */}
              <div ref={observerTarget} className="h-10 flex items-center justify-center mt-8">
                {loadingMore && (
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-6 h-6 border-2 rounded-full animate-spin"
                      style={{ borderColor: colors.background.light, borderTopColor: colors.accent.primary }}
                    ></div>
                    <p className="text-sm" style={{ color: colors.text.dark }}>Loading more courses...</p>
                  </div>
                )}
                {!hasMore && displayedTrendingCourses.length > 0 && (
                  <p className="text-sm mb-8" style={{ color: colors.accent.primary }}>No more courses to load</p>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Footer - Premium Layout */}
      <Footer />
    </div>
  );
}
