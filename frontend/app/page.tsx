'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { coursesAPI } from '@/lib/api';
import PureLogicsNavbar from '@/app/components/PureLogicsNavbar';
import SearchBar from '@/app/components/SearchBar';
import CourseCard from '@/app/components/CourseCard';
import CompactCourseCard from '@/app/components/CompactCourseCard';
import Footer from '@/app/components/Footer';
import { ArrowRight } from 'lucide-react';
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
    <div className="min-h-screen w-full" style={{ backgroundColor: colors.background.primary, color: colors.text.primary }}>
      <PureLogicsNavbar />

      {/* Hero Section - Purple Background with Search */}
      <section className="section-after-header relative pb-16 md:pb-20 lg:pb-24 overflow-hidden" style={{ backgroundColor: '#8B5CF6' }}>
        <div className="max-w-[1400px] xl:max-w-[1600px] 2xl:max-w-[1800px] mx-auto w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[600px] lg:min-h-[700px]">
            {/* Left Side - Text Content */}
            <div className="flex flex-col justify-center">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-4 md:mb-6 leading-tight"
                style={{ color: '#FFFFFF' }}
              >
                New to{' '}
                <span style={{ color: '#10B981' }}>TopSkill?</span>
                <br />
                You are lucky.
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

              {/* Statistics */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="flex flex-wrap gap-6 md:gap-8 lg:gap-12 mt-8 md:mt-12"
              >
                <div className="flex flex-col">
                  <div className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-1">10M</div>
                  <div className="text-sm md:text-base text-white/80">HAPPY CUSTOMER</div>
                </div>
                <div className="hidden sm:block w-px bg-white/30"></div>
                <div className="flex flex-col">
                  <div className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-1">25K</div>
                  <div className="text-sm md:text-base text-white/80">POPULAR COURSE</div>
                </div>
                <div className="hidden sm:block w-px bg-white/30"></div>
                <div className="flex flex-col">
                  <div className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-1">10+</div>
                  <div className="text-sm md:text-base text-white/80">YEARS EXPERIENCES</div>
                </div>
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
                    Our Experienced Trainers are <span className="font-bold text-[#10B981]">Certified from</span>
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
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#10B981]/20 rounded-full blur-3xl"></div>
                
                {/* Main illustration area */}
                <div className="relative bg-white/5 backdrop-blur-sm rounded-3xl p-8 border-2 border-white/10">
                  <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-[#10B981]/20 to-purple-400/20 flex items-center justify-center">
                    {/* Placeholder for illustration - you can replace with an actual image */}
                    <div className="text-center">
                      <div className="w-32 h-32 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                        <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <p className="text-white/60 text-sm">Learning Illustration</p>
                    </div>
                  </div>
                </div>
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

      {/* Trending Courses Section with Tabs */}
      <section className="py-20 mb-50" style={{ backgroundColor: colors.background.secondary }}>
        <div className="max-w-container xl:max-w-container-xl 2xl:max-w-container-2xl mx-auto w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ color: colors.text.dark }}>
              Trending Courses
            </h2>
            <p className="text-xl max-w-3xl mx-auto mb-8" style={{ color: colors.text.dark }}>
              Discover the most popular courses loved by thousands of learners
            </p>
            
            {/* Tab Buttons */}
            <div className="flex items-center justify-center gap-4 mb-12">
              <button
                onClick={() => setActiveTab('online')}
                className={`px-6 py-3 rounded-xl font-semibold text-base md:text-lg transition-all duration-300 ${
                  activeTab === 'online'
                    ? 'shadow-lg'
                    : 'hover:opacity-80'
                }`}
                style={{
                  backgroundColor: activeTab === 'online' ? colors.button.primary : colors.background.secondary,
                  color: activeTab === 'online' ? colors.text.white : colors.text.dark,
                  borderWidth: activeTab === 'online' ? '0' : '2px',
                  borderStyle: 'solid',
                  borderColor: colors.border.primary,
                }}
              >
                Online Courses
              </button>
              <button
                onClick={() => setActiveTab('physical')}
                className={`px-6 py-3 rounded-xl font-semibold text-base md:text-lg transition-all duration-300 ${
                  activeTab === 'physical'
                    ? 'shadow-lg'
                    : 'hover:opacity-80'
                }`}
                style={{
                  backgroundColor: activeTab === 'physical' ? colors.button.primary : colors.background.secondary,
                  color: activeTab === 'physical' ? colors.text.white : colors.text.dark,
                  borderWidth: activeTab === 'physical' ? '0' : '2px',
                  borderStyle: 'solid',
                  borderColor: colors.border.primary,
                }}
              >
                Physical Courses
              </button>
            </div>
          </motion.div>

          {loading ? (
            <div className="text-center py-20">
              <div 
                className="w-16 h-16 border-4 rounded-full animate-spin mx-auto mb-4"
                style={{ borderColor: colors.border.primary, borderTopColor: colors.accent.primary }}
              ></div>
              <p className="text-lg" style={{ color: colors.text.muted }}>Loading courses...</p>
            </div>
          ) : displayedTrendingCourses.length === 0 ? (
            <div className="text-center py-20 text-lg" style={{ color: colors.text.muted }}>
              No {activeTab === 'online' ? 'online' : 'physical'} courses available
            </div>
          ) : (
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
                      style={{ borderColor: colors.border.primary, borderTopColor: colors.accent.primary }}
                    ></div>
                    <p className="text-sm" style={{ color: colors.text.muted }}>Loading more courses...</p>
                  </div>
                )}
                {!hasMore && displayedTrendingCourses.length > 0 && (
                  <p className="text-sm" style={{ color: colors.text.muted }}>No more courses to load</p>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA Section - Premium Design */}
      <section className="py-24 relative overflow-hidden mb-50" style={{ backgroundColor: colors.background.secondary }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-[1400px] xl:max-w-[1600px] 2xl:max-w-[1800px] mx-auto w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 text-center relative z-10"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6" style={{ color: colors.text.dark }}>
            Ready to Start Learning?
          </h2>
          <p className="text-xl md:text-2xl mb-10" style={{ color: colors.text.dark }}>
            Join thousands of students already learning with us
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/courses"
              className="inline-block px-10 py-5 font-bold text-lg rounded-xl transition-all duration-300 shadow-xl hover:shadow-2xl"
              style={{ backgroundColor: colors.button.primary, color: colors.text.white }}
            >
              Browse All Courses
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer - Premium Layout */}
      <Footer />
    </div>
  );
}
