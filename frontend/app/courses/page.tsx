'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { coursesAPI } from '@/lib/api';
import { Search, Star, Users, Filter, Grid3x3, List } from 'lucide-react';
import PureLogicsNavbar from '@/app/components/PureLogicsNavbar';
import Footer from '@/app/components/Footer';
import CourseCard from '@/app/components/CourseCard';
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

export default function CoursesPage() {
  const searchParams = useSearchParams();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const requestIdRef = useRef(0);

  // Load courses on initial mount
  useEffect(() => {
    loadCourses();
  }, []);

  // Load courses when filters or sortBy change
  useEffect(() => {
    loadCourses();
  }, [filter, sortBy]);

  // Load courses when search changes (local state only, no URL update)
  useEffect(() => {
    loadCourses();
  }, [search]);

  const loadCourses = async () => {
    const currentRequestId = ++requestIdRef.current;
    try {
      const params: any = {};
      
      // Use state values
      if (filter !== 'all') {
        params.modality = filter;
      }
      
      // Get category from URL params (category can still use URL)
      const category = searchParams.get('category');
      if (category) {
        params.category = category;
      }
      
      // Use search state (local state only, not in URL)
      if (search) {
        params.search = search;
      }
      
      const response = await coursesAPI.getAll(params);
      
      // Only update state if this is still the latest request (prevents race conditions)
      if (currentRequestId === requestIdRef.current) {
        // Handle different response formats (pagination vs direct array)
        let coursesData = [];
        if (response.data) {
          if (response.data.results && Array.isArray(response.data.results)) {
            coursesData = response.data.results;
          } else if (Array.isArray(response.data)) {
            coursesData = response.data;
          }
        }
        
        console.log('Courses API Response:', {
          total: coursesData.length,
          hasResults: !!response.data?.results,
          isArray: Array.isArray(response.data),
          fullResponse: response.data
        });
        
        setCourses(coursesData);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error loading courses:', error);
      // Only update state if this is still the latest request
      if (currentRequestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search will trigger loadCourses via useEffect
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    // Search will trigger loadCourses via useEffect
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background.primary, color: colors.text.dark }}>
      <style jsx global>{`
        input::placeholder {
          color: ${colors.text.muted} !important;
        }
      `}</style>
      <PureLogicsNavbar />

      {/* Hero Banner */}
      <section className="section-after-header relative pb-12 md:pb-16 lg:pb-20 xl:pb-24 mb-12">
        <div className="max-w-[1400px] xl:max-w-[1600px] 2xl:max-w-[1800px] mx-auto w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 text-center relative z-10">
          <div className="inline-block mb-5 md:mb-6">
            <span className="px-4 md:px-5 py-1.5 md:py-2.5 rounded-full text-xs md:text-sm font-black backdrop-blur-sm flex items-center gap-2" style={{ backgroundColor: `${colors.accent.primary}20`, borderColor: `${colors.accent.primary}40`, borderWidth: '1px', borderStyle: 'solid', color: colors.accent.primary }}>
              Discover Amazing Courses
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-black mb-3 md:mb-4 lg:mb-6 xl:mb-8" style={{ color: colors.text.dark }}>
            Browse All Courses
          </h1>
          <p className="text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl max-w-3xl xl:max-w-4xl mx-auto" style={{ color: colors.text.dark }}>
            Explore thousands of courses designed to transform your career
          </p>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="relative pb-6 md:pb-8 lg:pb-10 mb-12">
        <div className="max-w-[1400px] xl:max-w-[1600px] 2xl:max-w-[1800px] mx-auto w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
          <div className="rounded-2xl p-4 md:p-5 lg:p-6 shadow-2xl" style={{ backgroundColor: colors.background.card, borderColor: colors.border.primary, borderWidth: '1px', borderStyle: 'solid' }}>
            <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-center">
              <form onSubmit={handleSearch} className="flex-1 w-full">
                <div className="relative group">
                  <Search className="absolute left-4 md:left-5 top-1/2 transform -translate-y-1/2 transition-colors w-5 h-5" style={{ color: colors.text.muted }} />
                  <input
                    type="text"
                    placeholder="Search courses by title, instructor, or topic..."
                    value={search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full pl-12 md:pl-14 pr-4 md:pr-5 py-3 md:py-3.5 lg:py-4 rounded-xl focus:outline-none focus:ring-2 transition-all text-sm md:text-base"
                    style={{ 
                      backgroundColor: colors.background.secondary, 
                      borderColor: colors.border.primary, 
                      borderWidth: '1px', 
                      borderStyle: 'solid',
                      color: colors.text.dark,
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = colors.accent.primary;
                      e.currentTarget.style.boxShadow = `0 0 0 2px ${colors.accent.primary}50`;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = colors.border.primary;
                      e.currentTarget.style.boxShadow = '';
                    }}
                  />
                </div>
              </form>
              <div className="flex items-center gap-2 md:gap-3 lg:gap-4">
                <div className="flex items-center gap-2 md:gap-3 bg-[#0F172A] border border-[#334155] rounded-xl px-3 md:px-4 py-2.5 md:py-3">
                  <Filter className="text-[#10B981] w-5 h-5" />
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="bg-transparent border-none text-white focus:outline-none cursor-pointer font-semibold text-xs md:text-sm"
                  >
                    <option value="all" className="bg-[#1E293B]">All Courses</option>
                    <option value="online" className="bg-[#1E293B]">Online</option>
                    <option value="physical" className="bg-[#1E293B]">Physical</option>
                    <option value="hybrid" className="bg-[#1E293B]">Hybrid</option>
                  </select>
                </div>
                <div className="flex items-center gap-1 md:gap-2 bg-[#0F172A] border border-[#334155] rounded-xl px-0.5 md:px-1 py-2.5 md:py-3">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 md:p-2.5 lg:p-3 rounded-xl transition-all duration-300 ${
                      viewMode === 'grid' 
                        ? 'bg-[#10B981] text-white shadow-lg' 
                        : 'text-[#9CA3AF] hover:text-white hover:bg-[#1E293B]'
                    }`}
                  >
                    <Grid3x3 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 md:p-2.5 lg:p-3 rounded-xl transition-all duration-300 ${
                      viewMode === 'list' 
                        ? 'bg-[#10B981] text-white shadow-lg' 
                        : 'text-[#9CA3AF] hover:text-white hover:bg-[#1E293B]'
                    }`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Display */}
      <section className="relative pb-16 md:pb-20 lg:pb-24">
        <div className="max-w-[1400px] xl:max-w-[1600px] 2xl:max-w-[1800px] mx-auto w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
          {loading ? (
            <div className="text-center py-16 md:py-20 lg:py-24">
              <div className="w-16 h-16 md:w-20 md:h-20 border-4 border-[#334155] border-t-[#10B981] rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-[#9CA3AF] text-lg md:text-xl">Loading amazing courses...</p>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-16 md:py-20 lg:py-24">
              <div className="bg-[#1E293B] border border-[#334155] rounded-2xl p-10 md:p-12 lg:p-16 max-w-md mx-auto">
                <div className="text-5xl md:text-6xl lg:text-7xl mb-4">🔍</div>
                <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2">No courses found</h3>
                <p className="text-[#9CA3AF] text-sm md:text-base lg:text-lg">Try adjusting your search or filters</p>
              </div>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 lg:gap-8 xl:gap-10">
              {courses.map((course, idx) => (
                <div
                  key={course.id}
                  className="transform transition-all duration-500 hover:scale-105 w-full"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <CourseCard course={course} />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3 md:space-y-4 lg:space-y-6">
              {courses.map((course, idx) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.slug}`}
                  className="block group"
                >
                  <div className="bg-[#1E293B] border border-[#334155] rounded-2xl p-4 md:p-5 lg:p-6 hover:bg-[#334155] hover:border-[#10B981] transition-all duration-500 hover:scale-[1.01] hover:-translate-y-1">
                    <div className="flex items-start gap-4 md:gap-5 lg:gap-6">
                      <div className="relative w-28 md:w-40 lg:w-48 h-20 md:h-28 lg:h-32 rounded-xl overflow-hidden flex-shrink-0 bg-[#10B981]">
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
                        <h3 className="text-lg md:text-xl lg:text-2xl font-black text-white mb-1.5 md:mb-2 transition-colors">
                          {course.title}
                        </h3>
                        <p className="text-[#9CA3AF] mb-2 md:mb-3 line-clamp-2 text-sm md:text-base">{course.description}</p>
                        <p className="text-xs md:text-sm text-[#10B981] font-semibold mb-3 md:mb-4">{course.instructor_name}</p>
                        <div className="flex items-center gap-3 md:gap-4 lg:gap-6 text-xs md:text-sm flex-wrap">
                          {course.average_rating > 0 ? (
                            <div className="flex items-center gap-1 md:gap-1.5">
                              <Star className="text-[#10B981] fill-[#10B981] w-4 h-4" />
                              <span className="font-bold text-white">{course.average_rating.toFixed(1)}</span>
                              {course.rating_count && (
                                <span className="text-[#9CA3AF]">({course.rating_count})</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-[#6B7280]">No ratings yet</span>
                          )}
                          <div className="flex items-center gap-1 md:gap-1.5 text-[#9CA3AF]">
                            <Users className="w-4 h-4" />
                            <span>{course.enrolled_count || 0} students</span>
                          </div>
                          <span className="text-lg md:text-xl lg:text-2xl font-black text-[#10B981]">{formatPrice(course.price)}</span>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <span className={`px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-xs font-black backdrop-blur-md border ${
                          course.modality === 'online' 
                            ? 'bg-[#10B981] text-white border-[#10B981]' 
                            : 'bg-[#8B5CF6] text-white border-[#8B5CF6]'
                        }`}>
                          {course.modality.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
