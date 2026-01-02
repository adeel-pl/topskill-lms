'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { coursesAPI } from '@/lib/api';
import { FiSearch, FiStar, FiUsers, FiFilter, FiGrid, FiList } from 'react-icons/fi';
import PureLogicsNavbar from '@/app/components/PureLogicsNavbar';

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
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  useEffect(() => {
    loadCourses();
  }, [filter, sortBy]);

  const loadCourses = async () => {
    try {
      const params: any = {};
      if (filter !== 'all') {
        params.modality = filter;
      }
      if (search) {
        params.search = search;
      }
      
      const response = await coursesAPI.getAll(params);
      setCourses(response.data.results || response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading courses:', error);
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadCourses();
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
    <div className="min-h-screen bg-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <PureLogicsNavbar />

      {/* Hero Banner - Blue/Purple Gradient */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">Browse All Courses</h1>
          <p className="text-xl text-white/90">Discover thousands of courses to advance your career</p>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <form onSubmit={handleSearch} className="flex-1 w-full">
              <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search courses by title, instructor, or topic..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-sm text-[#000F2C] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#66CC33] focus:border-[#66CC33]"
                />
              </div>
            </form>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <FiFilter className="text-gray-400" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-4 py-3 bg-white border border-gray-300 rounded-sm text-[#000F2C] focus:outline-none focus:ring-2 focus:ring-[#66CC33] focus:border-[#66CC33]"
                >
                  <option value="all">All Courses</option>
                  <option value="online">Online</option>
                  <option value="physical">Physical</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-sm">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-[#66CC33] text-white' : 'text-gray-600 hover:text-[#000F2C]'}`}
                >
                  <FiGrid className="text-lg" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-[#66CC33] text-white' : 'text-gray-600 hover:text-[#000F2C]'}`}
                >
                  <FiList className="text-lg" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Courses List */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-[#66CC33] rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[#6a6f73]">Loading courses...</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12 text-[#6a6f73]">No courses found</div>
        ) : viewMode === 'list' ? (
          <div className="space-y-0">
            {courses.map((course, index) => (
              <div key={course.id} className="border-b border-blue-200">
                <Link
                  href={`/courses/${course.slug}`}
                  className="block py-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 pr-6">
                      <h3 className="text-2xl font-bold mb-2 text-[#000F2C] hover:text-[#66CC33] transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-[#6a6f73] mb-3">{course.description}</p>
                      <p className="text-sm text-[#6a6f73] mb-4">
                        <span className="underline">{course.instructor_name}</span>
                      </p>
                      <div className="flex items-center gap-6 text-sm text-[#6a6f73]">
                        {course.average_rating > 0 ? (
                          <div className="flex items-center gap-1">
                            <FiStar className="text-[#e59819] fill-[#e59819]" />
                            <span className="font-semibold text-[#b4690e]">{course.average_rating.toFixed(1)}</span>
                            {course.rating_count && (
                              <span>({course.rating_count > 1000 ? `${(course.rating_count / 1000).toFixed(1)}K` : course.rating_count})</span>
                            )}
                          </div>
                        ) : (
                          <span>No ratings yet</span>
                        )}
                        <div className="flex items-center gap-1">
                          <FiUsers />
                          <span>{course.enrolled_count || 0} students</span>
                        </div>
                        <span className="underline font-semibold text-[#000F2C]">{formatPrice(course.price)}</span>
                        <span>{course.total_lectures || 0} lectures</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <span className={`px-3 py-1.5 rounded-sm text-xs font-semibold ${
                        course.modality === 'online' 
                          ? 'bg-[#66CC33] text-[#000F2C]' 
                          : course.modality === 'physical'
                          ? 'bg-[#66CC33] text-[#000F2C]'
                          : 'bg-[#66CC33] text-[#000F2C]'
                      }`}>
                        {course.modality === 'online' ? 'ONLINE' : course.modality === 'physical' ? 'PHYSICAL' : 'HYBRID'}
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {courses.map((course) => (
              <Link
                key={course.id}
                href={`/courses/${course.slug}`}
                className="block bg-white rounded-sm overflow-hidden hover:shadow-lg transition-shadow duration-200 border border-gray-200"
              >
                <div className="relative w-full h-40 bg-gradient-to-br from-[#66CC33] to-[#4da826] overflow-hidden">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-white text-4xl font-bold">{course.title.charAt(0)}</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-base font-bold text-[#000F2C] mb-2 line-clamp-2 hover:text-[#66CC33] transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-xs text-[#6a6f73] mb-2">{course.instructor_name}</p>
                  <div className="flex items-center gap-2 mb-2">
                    {course.average_rating > 0 ? (
                      <>
                        <span className="text-sm font-bold text-[#b4690e]">{course.average_rating.toFixed(1)}</span>
                        <FiStar className="text-[#e59819] fill-[#e59819] text-xs" />
                      </>
                    ) : (
                      <span className="text-xs text-[#6a6f73]">No ratings yet</span>
                    )}
                  </div>
                  <div className="mt-3">
                    <span className="text-xl font-bold text-[#000F2C]">{formatPrice(course.price)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
