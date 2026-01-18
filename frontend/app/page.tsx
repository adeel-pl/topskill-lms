'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { coursesAPI } from '@/lib/api';
import PureLogicsNavbar from '@/app/components/PureLogicsNavbar';
import CourseCard from '@/app/components/CourseCard';
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
    <div className="min-h-screen w-full" style={{ backgroundColor: colors.background.primary, color: colors.text.primary }}>
      <PureLogicsNavbar />

      {/* Hero Section - Premium Design */}
      <section className="section-after-header relative pb-24 overflow-hidden mb-50" style={{ backgroundColor: colors.background.primary }}>

        <div className="max-w-container xl:max-w-container-xl 2xl:max-w-container-2xl mx-auto w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 relative z-10">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight"
              style={{ color: colors.text.dark }}
            >
              Learn Without Limits
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl md:text-2xl max-w-4xl mx-auto mb-10 leading-relaxed"
              style={{ color: colors.text.dark }}
            >
              Master in-demand skills with world-class instructors. 
              <span style={{ color: colors.accent.primary }} className="font-semibold"> Start your learning journey today.</span>
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
                  className="group px-8 py-4 font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
                  style={{ backgroundColor: colors.button.primary, color: colors.text.white }}
                >
                  Explore Courses
                  <ArrowRight className="group-hover:translate-x-1 transition-transform w-5 h-5" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/dashboard/my-courses"
                  className="px-8 py-4 border-2 font-semibold text-lg rounded-xl transition-all duration-300"
                  style={{ 
                    backgroundColor: colors.background.card, 
                    borderColor: colors.border.primary,
                    color: colors.text.dark
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = colors.accent.primary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = colors.border.primary;
                  }}
                >
                  My Learning
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Online Courses Section */}
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
              Online Courses
            </h2>
            <p className="text-xl max-w-3xl mx-auto mb-8" style={{ color: colors.text.dark }}>
              Learn at your own pace with our comprehensive online courses
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
          ) : (
            (() => {
              const onlineCourses = courses.filter((c: Course) => c.modality === 'online' || !c.modality);
              return onlineCourses.length === 0 ? (
                <div className="text-center py-20 text-lg" style={{ color: colors.text.muted }}>No online courses available</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-10">
                  {onlineCourses.slice(0, 8).map((course, index) => (
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
              const physicalCourses = courses.filter((c: Course) => c.modality === 'physical' || c.modality === 'hybrid');
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
