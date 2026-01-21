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

// Certification logos data from topskills.pk - All logos from the slider
const certificationLogos = [
  { 
    name: 'Coursera', 
    url: 'https://topskills.pk/wp-content/uploads/2024/01/coursera-logo.png',
    fallback: 'https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://coursera-university-assets.s3.amazonaws.com/83/ab2000a57211e8b8d5c0b47d3d9fa/Coursera-Logo_landscape_blue.png'
  },
  { 
    name: 'Microsoft Azure', 
    url: 'https://topskills.pk/wp-content/uploads/2024/01/microsoft-azure-logo.png',
    fallback: 'https://azure.microsoft.com/svghandler/azure/azure-logo.svg'
  },
  { 
    name: 'Udemy', 
    url: 'https://topskills.pk/wp-content/uploads/2024/01/udemy-logo.png',
    fallback: 'https://www.udemy.com/staticx/udemy/images/v7/logo-udemy.svg'
  },
  { 
    name: 'Amazon Web Services', 
    url: 'https://topskills.pk/wp-content/uploads/2024/01/aws-logo.png',
    fallback: 'https://a0.awsstatic.com/libra-css/images/logos/aws_logo_smile_1200x630.png'
  },
  { 
    name: 'Microsoft Windows', 
    url: 'https://topskills.pk/wp-content/uploads/2024/01/microsoft-windows-logo.png',
    fallback: 'https://img-prod-cms-rt-microsoft-com.akamaized.net/cms/api/am/imageFileData/RE1Mu3b?ver=5c31'
  },
  { 
    name: 'Google Cloud', 
    url: 'https://topskills.pk/wp-content/uploads/2024/01/google-cloud-logo.png',
    fallback: 'https://cloud.google.com/images/social-icon-google-cloud-1200-630.png'
  },
  { 
    name: 'Oracle', 
    url: 'https://topskills.pk/wp-content/uploads/2024/01/oracle-logo.png',
    fallback: 'https://www.oracle.com/a/ocom/img/rc24/oracle-logo-white.svg'
  },
  { 
    name: 'Cisco', 
    url: 'https://topskills.pk/wp-content/uploads/2024/01/cisco-logo.png',
    fallback: 'https://www.cisco.com/c/en/us/about/brand-center/assets/img/cisco-logo.png'
  },
  { 
    name: 'CompTIA', 
    url: 'https://topskills.pk/wp-content/uploads/2024/01/comptia-logo.png',
    fallback: 'https://www.comptia.org/images/default-source/logos/comptia-logo.png'
  },
  { 
    name: 'Red Hat', 
    url: 'https://topskills.pk/wp-content/uploads/2024/01/redhat-logo.png',
    fallback: 'https://www.redhat.com/cms/managed-files/logo-red-hat-841x315.png'
  },
  { 
    name: 'IBM', 
    url: 'https://topskills.pk/wp-content/uploads/2024/01/ibm-logo.png',
    fallback: 'https://www.ibm.com/brand/experience-guides/developer/b1db1ae501d522a1a4b49613fe07c9b1/01_8-bar-reverse.svg'
  },
  { 
    name: 'Salesforce', 
    url: 'https://topskills.pk/wp-content/uploads/2024/01/salesforce-logo.png',
    fallback: 'https://www.salesforce.com/content/dam/web/en_us/www/images/logo-salesforce.svg'
  },
  { 
    name: 'VMware', 
    url: 'https://topskills.pk/wp-content/uploads/2024/01/vmware-logo.png',
    fallback: 'https://www.vmware.com/content/dam/digital-marketing/vmware/en/images/logo/vmware-logo-grey.svg'
  },
  { 
    name: 'Docker', 
    url: 'https://topskills.pk/wp-content/uploads/2024/01/docker-logo.png',
    fallback: 'https://www.docker.com/wp-content/uploads/2022/03/vertical-logo-monochromatic.svg'
  },
  { 
    name: 'Kubernetes', 
    url: 'https://topskills.pk/wp-content/uploads/2024/01/kubernetes-logo.png',
    fallback: 'https://kubernetes.io/images/kubernetes-logo.svg'
  },
  { 
    name: 'Linux Foundation', 
    url: 'https://topskills.pk/wp-content/uploads/2024/01/linux-foundation-logo.png',
    fallback: 'https://www.linuxfoundation.org/wp-content/uploads/2018/09/logo.png'
  },
  { 
    name: 'Adobe', 
    url: 'https://topskills.pk/wp-content/uploads/2024/01/adobe-logo.png',
    fallback: 'https://www.adobe.com/content/dam/shared/images/product-icons/svg/adobe-logo.svg'
  },
  { 
    name: 'Meta', 
    url: 'https://topskills.pk/wp-content/uploads/2024/01/meta-logo.png',
    fallback: 'https://about.meta.com/wp-content/uploads/sites/3/2021/10/Meta-Logo.svg'
  },
];

export default function HomePage() {
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [displayedCourses, setDisplayedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);
  const coursesPerPage = 8; // Load 8 courses at a time (2 rows of 4)

  useEffect(() => {
    loadAllCourses();
  }, []);

  const loadAllCourses = async () => {
    try {
      console.log('Loading courses...');
      const response = await coursesAPI.getAll({ page_size: 100 }); // Load more courses for infinite scroll
      console.log('API Response:', response);
      console.log('Response data:', response.data);
      
      // Handle paginated response
      let coursesData: Course[] = [];
      if (response.data) {
        if (response.data.results && Array.isArray(response.data.results)) {
          coursesData = response.data.results;
        } else if (Array.isArray(response.data)) {
          coursesData = response.data;
        }
      }
      
      console.log('Courses data:', coursesData);
      setAllCourses(coursesData);
      // Initially display first batch
      setDisplayedCourses(coursesData.slice(0, coursesPerPage));
      setHasMore(coursesData.length > coursesPerPage);
      setLoading(false);
    } catch (error: any) {
      console.error('Error loading courses:', error);
      console.error('Error message:', error?.message);
      console.error('Error response:', error?.response);
      setAllCourses([]);
      setDisplayedCourses([]);
      setLoading(false);
    }
  };

  const loadMoreCourses = useCallback(() => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    // Simulate slight delay for better UX
    setTimeout(() => {
      const currentLength = displayedCourses.length;
      const nextBatch = allCourses.slice(currentLength, currentLength + coursesPerPage);
      
      if (nextBatch.length > 0) {
        setDisplayedCourses(prev => [...prev, ...nextBatch]);
        setHasMore(currentLength + nextBatch.length < allCourses.length);
      } else {
        setHasMore(false);
      }
      setLoadingMore(false);
    }, 300);
  }, [displayedCourses.length, allCourses, loadingMore, hasMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMoreCourses();
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
  }, [loadMoreCourses, hasMore, loadingMore]);

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
                  <h3 className="text-lg md:text-xl font-semibold mb-1 text-white/90">
                    Our Experienced Trainers are
                  </h3>
                  <h4 className="text-base md:text-lg font-bold text-[#10B981]">
                    Certified from
                  </h4>
                </div>
                
                {/* Logos Carousel */}
                <div className="relative overflow-hidden rounded-xl py-4">
                  <div className="flex items-center gap-6 md:gap-8 lg:gap-12 animate-scroll-hero">
                    {/* Render logos twice for seamless infinite scroll */}
                    {[...certificationLogos, ...certificationLogos].map((logo, index) => (
                      <div key={`${logo.name}-${index}`} className="flex-shrink-0 flex items-center justify-center h-12 md:h-16 w-24 md:w-32">
                        <img 
                          src={logo.url} 
                          alt={logo.name} 
                          className="h-full w-auto max-w-full object-contain opacity-80 hover:opacity-100 transition-opacity duration-300 filter brightness-0 invert"
                          onError={(e) => {
                            // Try fallback URL if main URL fails
                            if (logo.fallback && e.currentTarget.src !== logo.fallback) {
                              e.currentTarget.src = logo.fallback;
                            } else {
                              // Hide if both URLs fail
                              e.currentTarget.style.display = 'none';
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
            transform: translateX(-50%);
          }
        }
        .animate-scroll-hero {
          animation: scroll-hero 40s linear infinite;
        }
        .animate-scroll-hero:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* Trending Courses Section */}
      <section className="py-20 mb-50" style={{ backgroundColor: colors.background.secondary }}>
        <div className="max-w-container xl:max-w-container-xl 2xl:max-w-container-2xl mx-auto w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ color: colors.text.dark }}>
              Trending Courses
            </h2>
            <p className="text-xl max-w-3xl mx-auto mb-8" style={{ color: colors.text.dark }}>
              Discover the most popular courses loved by thousands of learners
            </p>
          </motion.div>
          {loading ? (
            <div className="text-center py-20">
              <div 
                className="w-16 h-16 border-4 rounded-full animate-spin mx-auto mb-4"
                style={{ borderColor: colors.border.primary, borderTopColor: colors.accent.primary }}
              ></div>
              <p className="text-lg" style={{ color: colors.text.muted }}>Loading courses...</p>
            </div>
          ) : displayedCourses.length === 0 ? (
            <div className="text-center py-20 text-lg" style={{ color: colors.text.muted }}>No courses available</div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {displayedCourses.map((course, index) => (
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
                {!hasMore && displayedCourses.length > 0 && (
                  <p className="text-sm" style={{ color: colors.text.muted }}>No more courses to load</p>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Physical Courses / Bootcamps Section */}
      <section className="py-20 mb-50" style={{ backgroundColor: colors.background.primary }}>
        <div className="max-w-container xl:max-w-container-xl 2xl:max-w-container-2xl mx-auto w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ color: colors.text.dark }}>
              Physical Courses & Bootcamps
            </h2>
            <p className="text-xl max-w-3xl mx-auto mb-8" style={{ color: colors.text.dark }}>
              Join our in-person classes, bootcamps, and internship programs with hands-on learning
            </p>
          </motion.div>
          {loading ? (
            <div className="text-center py-20">
              <div 
                className="w-16 h-16 border-4 rounded-full animate-spin mx-auto mb-4"
                style={{ borderColor: colors.border.primary, borderTopColor: colors.accent.primary }}
              ></div>
              <p className="text-lg" style={{ color: colors.text.dark }}>Loading courses...</p>
            </div>
          ) : (
            (() => {
              const physicalCourses = allCourses.filter((c: Course) => c.modality === 'physical' || c.modality === 'hybrid');
              return physicalCourses.length === 0 ? (
                <div className="text-center py-20 text-lg" style={{ color: colors.text.dark }}>No physical courses or bootcamps available</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-10">
                  {physicalCourses.slice(0, 8).map((course, index) => (
                    <div key={course.id} className="w-full">
                      <CourseCard course={course} index={index} />
                    </div>
                  ))}
                </div>
              );
            })()
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
