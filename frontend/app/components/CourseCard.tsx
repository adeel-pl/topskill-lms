'use client';

import Link from 'next/link';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { colors } from '@/lib/colors';

interface CourseCardProps {
  course: {
    id: number;
    title: string;
    slug: string;
    description?: string;
    price: number;
    thumbnail?: string;
    instructor_name: string;
    enrolled_count?: number;
    average_rating?: number;
    rating_count?: number;
    total_duration_hours?: number;
    total_lectures?: number;
    modality?: string;
  };
  index?: number;
}

export default function CourseCard({ course, index = 0 }: CourseCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="w-full h-full"
    >
      <Link href={`/courses/${course.slug}`} className="block group h-full">
        <div 
          className="h-full flex flex-col rounded-2xl overflow-hidden border transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 shadow-lg"
          style={{ 
            backgroundColor: colors.background.card,
            borderColor: colors.border.primary
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = colors.accent.primary;
            e.currentTarget.style.boxShadow = `0 20px 25px -5px ${colors.accent.primary}20`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = colors.border.primary;
            e.currentTarget.style.boxShadow = '';
          }}
        >
          {/* Course Image */}
          <div className="relative w-full aspect-video overflow-hidden" style={{ backgroundColor: colors.accent.primary }}>
            {course.thumbnail ? (
              <motion.img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.5 }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-white text-5xl font-black drop-shadow-lg">{course.title.charAt(0)}</span>
              </div>
            )}
          </div>

          {/* Course Content */}
          <div className="flex-1 p-5 md:p-6 flex flex-col">
            {/* Title */}
            <h3 
              className="text-lg font-bold mb-3 line-clamp-2 leading-snug min-h-[3.5rem] transition-colors duration-300 px-1"
              style={{ color: colors.text.dark }}
              onMouseEnter={(e) => e.currentTarget.style.color = colors.accent.primary}
              onMouseLeave={(e) => e.currentTarget.style.color = colors.text.dark}
            >
              {course.title}
            </h3>
            
            {/* Instructor */}
            <p className="text-sm mb-4 md:mb-5 line-clamp-1 px-1" style={{ color: colors.text.muted }}>
              {course.instructor_name}
            </p>
            
            {/* Rating */}
            <div className="flex items-center gap-2 mb-4 md:mb-5 px-1">
              {course.average_rating && course.average_rating > 0 ? (
                <>
                  <span className="text-base font-bold text-[#F59E0B]">{course.average_rating.toFixed(1)}</span>
                  <Star className="text-[#F59E0B] fill-[#F59E0B] w-4 h-4" />
                  {course.rating_count && (
                    <span className="text-xs" style={{ color: colors.text.muted }}>
                      ({course.rating_count > 1000 ? `${(course.rating_count / 1000).toFixed(1)}K` : course.rating_count})
                    </span>
                  )}
                </>
              ) : (
                <span className="text-xs" style={{ color: colors.text.muted }}>No ratings yet</span>
              )}
            </div>

            {/* Price */}
            <div className="mt-auto pt-4 md:pt-5 border-t px-1" style={{ borderColor: colors.border.primary }}>
              <span className="text-2xl font-bold" style={{ color: colors.accent.primary }}>{formatPrice(course.price)}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
