'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { coursesAPI } from '@/lib/api';
import PureLogicsNavbar from '@/app/components/PureLogicsNavbar';
import CourseCard from '@/app/components/CourseCard';
import { FiArrowRight } from 'react-icons/fi';

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

export default function HomePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const response = await coursesAPI.getAll({ limit: 6 });
      setCourses(response.data.results || response.data.slice(0, 6));
      setLoading(false);
    } catch (error) {
      console.error('Error loading courses:', error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#000F2C] text-white">
      <PureLogicsNavbar />

      {/* Hero Section */}
      <section className="bg-[#000F2C] py-20 border-b border-[#1a2a4a]">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Learn Without Limits</h1>
          <p className="text-xl text-[#E5E7EB] mb-8 max-w-2xl mx-auto">
            Start, switch, or advance your career with thousands of courses from world-class instructors
          </p>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 bg-[#66CC33] hover:bg-[#4da826] text-[#000F2C] px-8 py-4 rounded-sm font-bold text-lg transition-colors"
          >
            Explore Courses
            <FiArrowRight />
          </Link>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8">Featured Courses</h2>
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-[#1a2a4a] border-t-[#66CC33] rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[#E5E7EB]">Loading courses...</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12 text-[#E5E7EB]">No courses available</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="w-16 h-16 bg-[#66CC33] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#000F2C]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#000F2C] mb-2">Learn in-demand skills</h3>
              <p className="text-[#6a6f73]">With over 250,000 video courses</p>
            </div>
            <div>
              <div className="w-16 h-16 bg-[#66CC33] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#000F2C]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#000F2C] mb-2">Expert instructors</h3>
              <p className="text-[#6a6f73]">Choose courses taught by real-world experts</p>
            </div>
            <div>
              <div className="w-16 h-16 bg-[#66CC33] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#000F2C]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#000F2C] mb-2">Learn at your own pace</h3>
              <p className="text-[#6a6f73]">With lifetime access on mobile and desktop</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
