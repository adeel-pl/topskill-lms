'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { coursesAPI } from '@/lib/api';
import PureLogicsNavbar from '@/app/components/PureLogicsNavbar';
import SearchBar from '@/app/components/SearchBar';
import CourseCardNew from '@/app/components/CourseCardNew';
import Footer from '@/app/components/Footer';
import { ArrowRight, Grid3x3, List } from 'lucide-react';
import { motion } from 'framer-motion';
import { Container } from '@/app/components/ui/container';
import { Section } from '@/app/components/ui/section';
import { Heading } from '@/app/components/ui/heading';
import { Text } from '@/app/components/ui/text';
import { Button, buttonVariants } from '@/app/components/ui/button';
import { cn } from '@/lib/utils';
import { colors } from '@/lib/colors';

interface Course {
  id: number;
  title: string;
  slug: string;
  description: string;
  short_description?: string;
  price: number;
  thumbnail?: string;
  featured_image?: string;
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
      // Load all courses - use a large page_size or fetch all pages
      let allCoursesData: Course[] = [];
      let page = 1;
      let hasMorePages = true;

      while (hasMorePages) {
        const response = await coursesAPI.getAll({ page_size: 100, page });
        
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
      
      setAllCourses(allCoursesData);
      
      // Set initial trending courses based on active tab
      updateTrendingCourses(allCoursesData, activeTab, true);
      setLoading(false);
    } catch (error: any) {
      // Better error logging
      const errorMessage = error?.response?.data?.detail || error?.message || 'Unknown error';
      const errorStatus = error?.response?.status;
      console.error('Error loading courses:', {
        message: errorMessage,
        status: errorStatus,
        url: error?.config?.url,
        fullError: error
      });
      setAllCourses([]);
      setDisplayedTrendingCourses([]);
      setLoading(false);
    }
  };

  // Filter courses by modality - with defensive checks
  const getFilteredCourses = (courses: Course[], tab: 'online' | 'physical') => {
    if (!Array.isArray(courses)) {
      return [];
    }
    return tab === 'online' 
      ? courses.filter((c: Course) => c && (c.modality === 'online' || !c.modality))
      : courses.filter((c: Course) => c && (c.modality === 'physical' || c.modality === 'hybrid'));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Update trending courses when tab changes or on initial load - with defensive checks
  const updateTrendingCourses = useCallback((courses: Course[], tab: 'online' | 'physical', reset: boolean = false) => {
    try {
      const filtered = getFilteredCourses(courses, tab);
      if (!Array.isArray(filtered)) {
        setDisplayedTrendingCourses([]);
        setHasMore(false);
        return;
      }
      
      if (reset) {
        const safeSlice = filtered.slice(0, coursesPerPage);
        setDisplayedTrendingCourses(Array.isArray(safeSlice) ? safeSlice : []);
        setHasMore(filtered.length > coursesPerPage);
      } else {
        setDisplayedTrendingCourses(prev => {
          const currentLength = Array.isArray(prev) ? prev.length : 0;
          const nextBatch = filtered.slice(currentLength, currentLength + coursesPerPage);
          if (Array.isArray(nextBatch) && nextBatch.length > 0) {
            const prevArray = Array.isArray(prev) ? prev : [];
            const newList = [...prevArray, ...nextBatch];
            setHasMore(newList.length < filtered.length);
            return newList;
          } else {
            setHasMore(false);
            return Array.isArray(prev) ? prev : [];
          }
        });
      }
    } catch (error) {
      // Log error but don't crash - show empty state instead
      if (process.env.NODE_ENV === 'development') {
        console.error('Error updating trending courses:', error);
      }
      setDisplayedTrendingCourses([]);
      setHasMore(false);
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
    <div className="min-h-screen w-full bg-white">
      <PureLogicsNavbar />

      {/* Hero Section */}
      <section className="section-after-header relative pb-16 md:pb-20 lg:pb-24 overflow-hidden" style={{ backgroundColor: '#366854' }}>
        {/* Animated Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute rounded-full opacity-5 blur-3xl"
            style={{ 
              width: '400px', 
              height: '400px',
              backgroundColor: colors.highlight,
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
            className="absolute rounded-full opacity-5 blur-3xl"
            style={{ 
              width: '300px', 
              height: '300px',
              backgroundColor: colors.secondary,
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
            className="absolute rounded-full opacity-5 blur-2xl"
            style={{ 
              width: '250px', 
              height: '250px',
              backgroundColor: colors.accentColor,
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
        
        <Container size="2xl" className="relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[600px] lg:min-h-[700px]">
            {/* Left Side - Text Content */}
            <div className="flex flex-col justify-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Heading 
                  as="h1" 
                  size="display" 
                  className="mb-4 md:mb-6 text-white"
                >
                  Pakistan's No.1 IT Training Platform
                </Heading>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Text size="lg" className="mb-8 md:mb-10 text-white">
                  90% of our students land jobs in 6 months. Join thousands of successful graduates who transformed their careers with Top Skills.
                </Text>
              </motion.div>
              
              {/* Feature List */}
              <motion.ul
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="space-y-3 mb-8 md:mb-10"
              >
                {[
                  'Industry-recognized certification',
                  'Expert instructors from top companies',
                  'Job placement assistance included'
                ].map((feature, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 + idx * 0.1 }}
                    className="flex items-center gap-3 text-white"
                  >
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: colors.highlight }}>
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <Text size="base" className="text-white">{feature}</Text>
                  </motion.li>
                ))}
              </motion.ul>
              
              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="flex flex-wrap gap-4 mb-8 md:mb-10"
              >
                <Link href="/register" className={cn(buttonVariants({ variant: "default", size: "lg" }), "text-white")}>
                  Learn With Us
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="#" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "text-white border-white/30 hover:bg-white/10")}>
                  Watch Demo
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </Link>
              </motion.div>
              
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
                      style={{ color: colors.highlight }}
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
                      style={{ color: colors.secondary }}
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
                      style={{ color: colors.accentColor }}
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
                    Our Experienced Trainers are <span className="font-bold" style={{ color: colors.highlight }}>Certified from</span>
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
                            // Silently handle image load errors - don't spam console in production
                            if (process.env.NODE_ENV === 'development') {
                              console.error(`Failed to load logo: ${logo.name} from ${logo.url}`);
                            }
                            // Hide broken image
                            const target = e.target as HTMLImageElement;
                            if (target) {
                              target.style.display = 'none';
                            }
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
                <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl" style={{ backgroundColor: `${colors.highlight}30` }}></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full blur-3xl" style={{ backgroundColor: `${colors.secondary}30` }}></div>
                
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
        </Container>
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

      {/* Trending Courses Section */}
      <Section variant="default" padding="default">
        <Container>
          <div className="mb-12">
            {/* Header with Title and View Toggle */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
              <div className="text-center md:text-left">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <Heading as="h2" size="h1" className="mb-4">
                    Trending Courses
                  </Heading>
                  <Text size="lg" variant="muted" className="max-w-3xl">
                    Discover the most popular courses loved by thousands of learners
                  </Text>
                </motion.div>
              </div>
              
              {/* View Toggle Buttons */}
              <div className="flex items-center justify-center md:justify-end">
                <div className="flex items-center gap-1 bg-white rounded-xl px-1 py-1 shadow-sm" style={{ borderColor: colors.border.primary, borderWidth: '1px', borderStyle: 'solid' }}>
                  <button
                    onClick={() => setViewMode('grid')}
                    className="p-2.5 md:p-3 rounded-lg transition-all duration-300"
                    style={viewMode === 'grid' ? { backgroundColor: colors.primary, color: colors.text.white } : { color: colors.text.muted }}
                    onMouseEnter={(e) => {
                      if (viewMode !== 'grid') {
                        e.currentTarget.style.backgroundColor = colors.background.soft;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (viewMode !== 'grid') {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                    title="Grid View"
                  >
                    <Grid3x3 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className="p-2.5 md:p-3 rounded-lg transition-all duration-300"
                    style={viewMode === 'list' ? { backgroundColor: colors.primary, color: colors.text.white } : { color: colors.text.muted }}
                    onMouseEnter={(e) => {
                      if (viewMode !== 'list') {
                        e.currentTarget.style.backgroundColor = colors.background.soft;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (viewMode !== 'list') {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                    title="List View"
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Tab Buttons */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <Button
                variant={activeTab === 'online' ? 'default' : 'light'}
                onClick={() => setActiveTab('online')}
                className="min-w-[140px]"
              >
                Online Courses
              </Button>
              <Button
                variant={activeTab === 'physical' ? 'default' : 'light'}
                onClick={() => setActiveTab('physical')}
                className="min-w-[140px]"
              >
                Physical Courses
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 border-4 rounded-full animate-spin mx-auto mb-4" style={{ borderColor: colors.border.primary, borderTopColor: colors.primary }}></div>
              <Text size="lg">Loading courses...</Text>
            </div>
          ) : displayedTrendingCourses.length === 0 ? (
            <div className="text-center py-20">
              <Text size="lg">
                No {activeTab === 'online' ? 'online' : 'physical'} courses available
              </Text>
            </div>
          ) : viewMode === 'grid' ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
                {Array.isArray(displayedTrendingCourses) && displayedTrendingCourses.length > 0 ? (
                  displayedTrendingCourses.map((course, index) => {
                    // Defensive: Ensure course has required fields
                    if (!course || !course.id) {
                      return null;
                    }
                    return (
                      <CourseCardNew key={course.id} course={course} index={index} />
                    );
                  })
                ) : (
                  <div className="col-span-full text-center py-12">
                    <Text variant="muted">No courses available to display</Text>
                  </div>
                )}
              </div>
              
              {/* Infinite Scroll Trigger */}
              <div ref={observerTarget} className="h-10 flex items-center justify-center mt-8">
                {loadingMore && (
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: colors.border.primary, borderTopColor: colors.primary }}></div>
                    <Text size="sm">Loading more courses...</Text>
                  </div>
                )}
                {!hasMore && displayedTrendingCourses.length > 0 && (
                  <Text size="sm" style={{ color: colors.primary }}>No more courses to load</Text>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="space-y-4">
                {Array.isArray(displayedTrendingCourses) && displayedTrendingCourses.length > 0 ? (
                  displayedTrendingCourses.map((course, index) => {
                    // Defensive: Ensure course has required fields
                    if (!course || !course.id) {
                      return null;
                    }
                    const courseSlug = course.slug || `course-${course.id}`;
                    return (
                      <Link
                        key={course.id}
                        href={`/courses/${courseSlug}`}
                        className="block group"
                      >
                    <Card variant="default" hover={true} className="p-5">
                      <div className="flex items-start gap-5">
                        <div className="relative w-32 md:w-40 h-24 md:h-28 rounded-xl overflow-hidden flex-shrink-0" style={{ backgroundColor: colors.primary }}>
                          {(course.featured_image || course.thumbnail) ? (
                            <img
                              src={course.featured_image || course.thumbnail}
                              alt={course.title || 'Course'}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                if (target) {
                                  target.style.display = 'none';
                                }
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-white text-2xl font-extrabold">
                                {(course.title && course.title.length > 0) ? course.title.charAt(0).toUpperCase() : '?'}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Heading as="h3" size="h4" className="mb-2 transition-colors group-hover:text-[#366854]">
                            {course.title || 'Untitled Course'}
                          </Heading>
                          {course.description && (
                            <Text variant="muted" size="sm" className="mb-3 line-clamp-2">
                              {course.description}
                            </Text>
                          )}
                          {course.instructor_name && (
                            <Text variant="muted" size="sm" className="mb-4 font-semibold" style={{ color: colors.primary }}>
                              {course.instructor_name}
                            </Text>
                          )}
                          <div className="flex items-center gap-4 text-sm flex-wrap">
                            {course.average_rating && course.average_rating > 0 ? (
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4" style={{ color: colors.status.warning, fill: colors.status.warning }} />
                                <Text size="sm" className="font-semibold">
                                  {typeof course.average_rating === 'number' ? course.average_rating.toFixed(1) : '0.0'}
                                </Text>
                                {course.rating_count && course.rating_count > 0 && (
                                  <Text variant="muted" size="xs">({course.rating_count})</Text>
                                )}
                              </div>
                            ) : (
                              <Text variant="muted" size="xs">No ratings yet</Text>
                            )}
                            <Text variant="muted" size="sm" className="font-semibold" style={{ color: colors.primary }}>
                              {formatPrice(course.price)}
                            </Text>
                          </div>
                        </div>
                        {course.modality && typeof course.modality === 'string' && (
                          <div className="flex-shrink-0">
                            <span 
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                              style={{ 
                                backgroundColor: course.modality.toLowerCase() === 'online' ? colors.primary : colors.accentColor,
                              }}
                            >
                              {course.modality.toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                    </Card>
                  </Link>
                    );
                  })
                ) : (
                  <div className="text-center py-12">
                    <Text variant="muted">No courses available to display</Text>
                  </div>
                )}
              </div>
              
              {/* Infinite Scroll Trigger */}
              <div ref={observerTarget} className="h-10 flex items-center justify-center mt-8">
                {loadingMore && (
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: colors.border.primary, borderTopColor: colors.primary }}></div>
                    <Text size="sm">Loading more courses...</Text>
                  </div>
                )}
                {!hasMore && displayedTrendingCourses.length > 0 && (
                  <Text size="sm" style={{ color: colors.primary }}>No more courses to load</Text>
                )}
              </div>
            </>
          )}
        </Container>
      </Section>

      {/* Footer - Premium Layout */}
      <Footer />
    </div>
  );
}
