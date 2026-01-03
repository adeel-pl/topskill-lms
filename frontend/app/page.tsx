'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { coursesAPI } from '@/lib/api';
import PureLogicsNavbar from '@/app/components/PureLogicsNavbar';
import CourseCard from '@/app/components/CourseCard';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

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
      console.log('Loading courses...');
      const response = await coursesAPI.getAll();
      console.log('API Response:', response);
      console.log('Response data:', response.data);
      
      // Handle paginated response
      let coursesData = [];
      if (response.data) {
        if (response.data.results && Array.isArray(response.data.results)) {
          coursesData = response.data.results;
        } else if (Array.isArray(response.data)) {
          coursesData = response.data;
        }
      }
      
      console.log('Courses data:', coursesData);
      // Limit to 8 for homepage
      setCourses(coursesData.slice(0, 8));
      setLoading(false);
    } catch (error: any) {
      console.error('Error loading courses:', error);
      console.error('Error message:', error?.message);
      console.error('Error response:', error?.response);
      // Set empty array on error so it shows "No courses available"
      setCourses([]);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0F172A] text-white">
      <PureLogicsNavbar />

      {/* Hero Section - Premium Design */}
      <section className="relative pt-32 pb-24 overflow-hidden mb-50">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-0 right-0 w-96 h-96 bg-[#10B981] opacity-10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.15, 0.1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-0 left-0 w-96 h-96 bg-[#3B82F6] opacity-10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.15, 0.1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          />
        </div>

        <div className="max-w-container xl:max-w-container-xl 2xl:max-w-container-2xl mx-auto w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 relative z-10">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white mb-6 leading-tight"
            >
              Learn Without
              <br />
              <span className="bg-gradient-to-r from-[#10B981] via-[#3B82F6] to-[#8B5CF6] bg-clip-text text-transparent">
                Limits
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl md:text-2xl text-[#D1D5DB] max-w-4xl mx-auto mb-10 leading-relaxed"
            >
              Master in-demand skills with world-class instructors. 
              <span className="text-[#10B981] font-semibold"> Start your learning journey today.</span>
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/courses"
                  className="group px-8 py-4 bg-gradient-to-r from-[#10B981] to-[#059669] text-white font-bold text-lg rounded-xl shadow-lg shadow-[#10B981]/30 hover:shadow-[#10B981]/50 transition-all duration-300 flex items-center gap-2"
                >
                  Explore Courses
                  <ArrowRight className="group-hover:translate-x-1 transition-transform w-5 h-5" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/dashboard/my-courses"
                  className="px-8 py-4 bg-[#1E293B] border-2 border-[#334155] text-white font-semibold text-lg rounded-xl hover:bg-[#334155] hover:border-[#10B981] transition-all duration-300"
                >
                  My Learning
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Courses Section - Premium Grid */}
      <section className="py-20 mb-50">
        <div className="max-w-container xl:max-w-container-xl 2xl:max-w-container-2xl mx-auto w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Featured Courses
            </h2>
            <p className="text-xl text-[#9CA3AF] max-w-3xl mx-auto mb-8">
              Handpicked courses to accelerate your career
            </p>
          </motion.div>
          {loading ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 border-4 border-[#334155] border-t-[#10B981] rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-[#9CA3AF] text-lg">Loading courses...</p>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-20 text-[#9CA3AF] text-lg">No courses available</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 md:gap-8 lg:gap-10">
              {courses.map((course, index) => (
                <div key={course.id} className="w-full">
                  <CourseCard course={course} index={index} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section - Premium Design */}
      <section className="py-24 bg-gradient-to-br from-[#1E293B] to-[#0F172A] relative overflow-hidden mb-50">
        <div className="absolute inset-0 bg-gradient-to-r from-[#10B981]/5 via-transparent to-[#3B82F6]/5"></div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-[1400px] xl:max-w-[1600px] 2xl:max-w-[1800px] mx-auto w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 text-center relative z-10"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6">
            Ready to Start Learning?
          </h2>
          <p className="text-xl md:text-2xl text-[#D1D5DB] mb-10">
            Join thousands of students already learning with us
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/courses"
              className="inline-block px-10 py-5 bg-gradient-to-r from-[#10B981] to-[#059669] text-white font-bold text-lg rounded-xl transition-all duration-300 shadow-xl shadow-[#10B981]/30 hover:shadow-[#10B981]/50"
            >
              Browse All Courses
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer - Premium Layout */}
      <footer className="border-t border-[#334155] bg-[#0F172A] py-16 mt-50">
        <div className="max-w-container xl:max-w-container-xl 2xl:max-w-container-2xl mx-auto w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-12">
            {/* Brand */}
            <div className="sm:col-span-2 md:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-xl flex items-center justify-center shadow-lg shadow-[#10B981]/30">
                  <div className="w-6 h-6 bg-[#0F172A] rounded-lg"></div>
                </div>
                <span className="text-2xl font-black text-white">
                  Pure<span className="text-[#10B981]">Logics</span>
                </span>
              </div>
              <p className="text-[#9CA3AF] leading-relaxed mb-4 pr-4">
                Learn without limits. Transform your career with world-class courses.
              </p>
            </div>

            {/* Quick Links */}
            <div className="px-2">
              <h3 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">Quick Links</h3>
              <ul className="space-y-4">
                <li>
                  <Link href="/courses" className="text-[#9CA3AF] hover:text-[#10B981] transition-colors">
                    Browse Courses
                  </Link>
                </li>
                <li>
                  <Link href="/instructors" className="text-[#9CA3AF] hover:text-[#10B981] transition-colors">
                    Instructors
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/my-courses" className="text-[#9CA3AF] hover:text-[#10B981] transition-colors">
                    My Learning
                  </Link>
                </li>
                <li>
                  <Link href="/cart" className="text-[#9CA3AF] hover:text-[#10B981] transition-colors">
                    Cart
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div className="px-2">
              <h3 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">Support</h3>
              <ul className="space-y-4">
                <li>
                  <Link href="/dashboard/account" className="text-[#9CA3AF] hover:text-[#10B981] transition-colors">
                    Account Settings
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/certifications" className="text-[#9CA3AF] hover:text-[#10B981] transition-colors">
                    Certifications
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/purchase-history" className="text-[#9CA3AF] hover:text-[#10B981] transition-colors">
                    Purchase History
                  </Link>
                </li>
                <li>
                  <a href="#" className="text-[#9CA3AF] hover:text-[#10B981] transition-colors">
                    Help Center
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div className="px-2">
              <h3 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">Contact</h3>
              <ul className="space-y-4">
                <li className="text-[#9CA3AF]">support@purelogics.com</li>
                <li className="text-[#9CA3AF]">+1 (555) 123-4567</li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-[#334155] flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[#9CA3AF] text-center md:text-left">
              © {new Date().getFullYear()} PureLogics. All rights reserved.
            </p>
            <div className="flex gap-6 flex-wrap justify-center">
              <Link href="#" className="text-[#9CA3AF] hover:text-[#10B981] transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="text-[#9CA3AF] hover:text-[#10B981] transition-colors">
                Terms of Service
              </Link>
              <Link href="#" className="text-[#9CA3AF] hover:text-[#10B981] transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
