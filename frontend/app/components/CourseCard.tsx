'use client';

import Link from 'next/link';
import { FiStar } from 'react-icons/fi';

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
}

export default function CourseCard({ course }: CourseCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Link href={`/courses/${course.slug}`} className="block group">
      <div className="bg-white rounded-sm overflow-hidden hover:shadow-lg transition-shadow duration-200">
        {/* Course Image */}
        <div className="relative w-full h-40 bg-gradient-to-br from-[#66CC33] to-[#4da826] overflow-hidden">
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-white text-4xl font-bold">{course.title.charAt(0)}</span>
            </div>
          )}
        </div>

        {/* Course Content */}
        <div className="p-4">
          <h3 className="text-base font-bold text-[#000F2C] mb-2 line-clamp-2 group-hover:text-[#66CC33] transition-colors">
            {course.title}
          </h3>
          <p className="text-xs text-[#6a6f73] mb-2">{course.instructor_name}</p>
          
          {/* Rating and Students */}
          <div className="flex items-center gap-2 mb-2">
            {course.average_rating && course.average_rating > 0 ? (
              <>
                <span className="text-sm font-bold text-[#b4690e]">{course.average_rating.toFixed(1)}</span>
                <div className="flex items-center">
                  <FiStar className="text-[#e59819] fill-[#e59819] text-xs" />
                </div>
                {course.rating_count && (
                  <span className="text-xs text-[#6a6f73]">
                    ({course.rating_count > 1000 ? `${(course.rating_count / 1000).toFixed(1)}K` : course.rating_count})
                  </span>
                )}
              </>
            ) : (
              <span className="text-xs text-[#6a6f73]">No ratings yet</span>
            )}
            {course.enrolled_count && course.enrolled_count > 0 && (
              <>
                <span className="text-[#6a6f73]">•</span>
                <span className="text-xs text-[#6a6f73]">{course.enrolled_count} students</span>
              </>
            )}
          </div>

          {/* Price */}
          <div className="mt-3">
            <span className="text-xl font-bold text-[#000F2C]">{formatPrice(course.price)}</span>
          </div>

          {/* Badges */}
          {course.modality && (
            <div className="mt-2 flex gap-2">
              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                course.modality === 'online' 
                  ? 'bg-[#eceb98] text-[#3d3c0a]' 
                  : course.modality === 'hybrid'
                  ? 'bg-[#b3d4fc] text-[#0a4c8c]'
                  : 'bg-[#f3ca8c] text-[#614e1a]'
              }`}>
                {course.modality === 'online' ? 'Bestseller' : course.modality.toUpperCase()}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
