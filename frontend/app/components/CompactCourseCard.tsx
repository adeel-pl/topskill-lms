'use client';

import Link from 'next/link';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { colors } from '@/lib/colors';

interface CompactCourseCardProps {
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

export default function CompactCourseCard({ course, index = 0 }: CompactCourseCardProps) {
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
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="w-full"
    >
      <Link href={`/courses/${course.slug}`} className="block group">
        <div 
          className="h-[100px] flex items-center gap-3 rounded-xl overflow-hidden border transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
          style={{ 
            backgroundColor: colors.background.card,
            borderColor: colors.border.primary
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = colors.accent.primary;
            e.currentTarget.style.boxShadow = `0 4px 6px -1px ${colors.accent.primary}20`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = colors.border.primary;
            e.currentTarget.style.boxShadow = '';
          }}
        >
          {/* Course Thumbnail - 90x90 */}
          <div className="relative w-[90px] h-[90px] flex-shrink-0 overflow-hidden" style={{ backgroundColor: colors.accent.primary }}>
            {course.thumbnail ? (
              <motion.img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.3 }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-white text-2xl font-black drop-shadow-lg">{course.title.charAt(0)}</span>
              </div>
            )}
          </div>

          {/* Course Content */}
          <div className="flex-1 flex flex-col justify-center min-w-0 pr-3">
            {/* Title */}
            <h3 
              className="text-sm font-bold mb-1 line-clamp-1 transition-colors duration-300"
              style={{ color: colors.text.dark }}
              onMouseEnter={(e) => e.currentTarget.style.color = colors.accent.primary}
              onMouseLeave={(e) => e.currentTarget.style.color = colors.text.dark}
            >
              {course.title}
            </h3>
            
            {/* Instructor */}
            <p className="text-xs mb-1 line-clamp-1" style={{ color: colors.text.muted }}>
              {course.instructor_name}
            </p>
            
            {/* Rating and Price Row */}
            <div className="flex items-center justify-between gap-2">
              {/* Rating */}
              <div className="flex items-center gap-1">
                {course.average_rating && course.average_rating > 0 ? (
                  <>
                    <span className="text-xs font-bold text-[#F59E0B]">{course.average_rating.toFixed(1)}</span>
                    <Star className="text-[#F59E0B] fill-[#F59E0B] w-3 h-3" />
                    {course.rating_count && course.rating_count > 0 && (
                      <span className="text-xs" style={{ color: colors.text.muted }}>
                        ({course.rating_count > 1000 ? `${(course.rating_count / 1000).toFixed(1)}K` : course.rating_count})
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-xs" style={{ color: colors.text.muted }}>No ratings</span>
                )}
              </div>

              {/* Price */}
              <span className="text-base font-bold whitespace-nowrap" style={{ color: colors.accent.primary }}>
                {formatPrice(course.price)}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

