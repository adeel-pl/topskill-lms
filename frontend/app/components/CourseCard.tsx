'use client';

import Link from 'next/link';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

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
        <div className="h-full flex flex-col bg-[#1E293B] rounded-2xl overflow-hidden border border-[#334155] hover:border-[#10B981]/50 transition-all duration-300 hover:shadow-2xl hover:shadow-[#10B981]/20 hover:-translate-y-1 shadow-lg shadow-black/20">
          {/* Course Image */}
          <div className="relative w-full aspect-video bg-gradient-to-br from-[#10B981] via-[#3B82F6] to-[#8B5CF6] overflow-hidden">
            {course.thumbnail ? (
              <>
                <motion.img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-white text-5xl font-black drop-shadow-lg">{course.title.charAt(0)}</span>
              </div>
            )}
          </div>

          {/* Course Content */}
          <div className="flex-1 p-5 md:p-6 flex flex-col">
            {/* Title */}
            <h3 className="text-lg font-bold text-white mb-3 line-clamp-2 leading-snug min-h-[3.5rem] group-hover:text-[#10B981] transition-colors duration-300">
              {course.title}
            </h3>
            
            {/* Instructor */}
            <p className="text-sm text-[#9CA3AF] mb-4 md:mb-5 line-clamp-1 px-1">
              {course.instructor_name}
            </p>
            
            {/* Rating */}
            <div className="flex items-center gap-2 mb-4 md:mb-5 px-1">
              {course.average_rating && course.average_rating > 0 ? (
                <>
                  <span className="text-base font-bold text-[#F59E0B]">{course.average_rating.toFixed(1)}</span>
                  <Star className="text-[#F59E0B] fill-[#F59E0B] w-4 h-4" />
                  {course.rating_count && (
                    <span className="text-xs text-[#9CA3AF]">
                      ({course.rating_count > 1000 ? `${(course.rating_count / 1000).toFixed(1)}K` : course.rating_count})
                    </span>
                  )}
                </>
              ) : (
                <span className="text-xs text-[#6B7280]">No ratings yet</span>
              )}
            </div>

            {/* Price */}
            <div className="mt-auto pt-4 md:pt-5 border-t border-[#334155] px-1">
              <span className="text-2xl font-bold text-white">{formatPrice(course.price)}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
