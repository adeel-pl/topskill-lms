'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '@/app/components/AdminLayout';
import { adminAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import {
  FiSearch,
  FiPlus,
  FiEdit,
  FiEye,
  FiFilter,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';

export default function AdminCoursesPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [modality, setModality] = useState('');
  const [isActive, setIsActive] = useState<boolean | null>(null);

  useEffect(() => {
    // Wait for auth to finish loading before checking permissions
    if (authLoading) return;
    
    if (!isAuthenticated || !user?.is_staff) {
      router.push('/login');
      return;
    }
    loadCourses();
  }, [isAuthenticated, user, page, search, modality, isActive, authLoading, router]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        page_size: pageSize,
      };
      if (search) params.search = search;
      if (modality) params.modality = modality;
      if (isActive !== null) params.is_active = isActive;

      const response = await adminAPI.getCourses(params);
      setCourses(response.data.results);
      setTotal(response.data.count);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getModalityBadge = (mod: string) => {
    const colors: any = {
      online: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      physical: 'bg-green-500/20 text-green-400 border-green-500/30',
      hybrid: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    };
    return colors[mod] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Course Management</h1>
            <p className="text-[#9CA3AF]">Manage all courses in the system</p>
          </div>
          <Link
            href="/admin/courses/new"
            className="px-6 py-3 bg-[#048181] text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-[#048181]/30 transition-all flex items-center gap-2"
          >
            <FiPlus /> Create Course
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-[#0F172A] border border-[#334155] rounded-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9CA3AF] w-5 h-5" />
              <input
                type="text"
                placeholder="Search courses..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 bg-[#1E293B] border border-[#334155] rounded-lg text-white placeholder-[#9CA3AF] focus:outline-none focus:border-[#048181]"
              />
            </div>
            <select
              value={modality}
              onChange={(e) => {
                setModality(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 bg-[#1E293B] border border-[#334155] rounded-lg text-white focus:outline-none focus:border-[#048181]"
            >
              <option value="">All Modalities</option>
              <option value="online">Online</option>
              <option value="physical">Physical</option>
              <option value="hybrid">Hybrid</option>
            </select>
            <select
              value={isActive === null ? '' : isActive.toString()}
              onChange={(e) => {
                const value = e.target.value;
                setIsActive(value === '' ? null : value === 'true');
                setPage(1);
              }}
              className="px-4 py-2 bg-[#1E293B] border border-[#334155] rounded-lg text-white focus:outline-none focus:border-[#048181]"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
            <button
              onClick={() => {
                setSearch('');
                setModality('');
                setIsActive(null);
                setPage(1);
              }}
              className="px-4 py-2 bg-[#1E293B] border border-[#334155] rounded-lg text-white hover:border-[#048181] transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Courses Table */}
        <div className="bg-[#0F172A] border border-[#334155] rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-[#334155] border-t-[#048181] rounded-full animate-spin"></div>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#9CA3AF] mb-4">No courses found</p>
              <Link
                href="/admin/courses/new"
                className="inline-block px-6 py-3 bg-[#048181] text-white rounded-lg font-semibold"
              >
                Create First Course
              </Link>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#1E293B] border-b border-[#334155]">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white">Title</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white">Modality</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white">Price</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white">Enrollments</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white">Revenue</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white">Rating</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#334155]">
                    {courses.map((course) => (
                      <tr key={course.id} className="hover:bg-[#1E293B]/50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-white font-medium">{course.title}</p>
                            <p className="text-[#9CA3AF] text-sm">{course.slug}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getModalityBadge(course.modality)}`}>
                            {course.modality?.toUpperCase() || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-white font-semibold">
                          {formatCurrency(course.price)}
                        </td>
                        <td className="px-6 py-4 text-white">{course.enrollment_count}</td>
                        <td className="px-6 py-4 text-[#048181] font-semibold">
                          {formatCurrency(course.total_revenue)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-semibold">{course.rating.toFixed(1)}</span>
                            <span className="text-[#9CA3AF] text-sm">⭐</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            course.is_active
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                              : 'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}>
                            {course.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/admin/courses/${course.id}`}
                              className="p-2 bg-[#1E293B] border border-[#334155] rounded-lg hover:border-[#048181] transition-colors"
                              title="Edit"
                            >
                              <FiEdit className="w-4 h-4 text-[#048181]" />
                            </Link>
                            <Link
                              href={`/courses/${course.slug}`}
                              target="_blank"
                              className="p-2 bg-[#1E293B] border border-[#334155] rounded-lg hover:border-[#3B82F6] transition-colors"
                              title="View"
                            >
                              <FiEye className="w-4 h-4 text-[#3B82F6]" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {total > pageSize && (
                <div className="px-6 py-4 border-t border-[#334155] flex items-center justify-between">
                  <p className="text-[#9CA3AF] text-sm">
                    Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total} courses
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                      className="p-2 bg-[#1E293B] border border-[#334155] rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#048181] transition-colors"
                    >
                      <FiChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="px-4 py-2 bg-[#1E293B] border border-[#334155] rounded-lg text-white">
                      Page {page} of {Math.ceil(total / pageSize)}
                    </span>
                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={page >= Math.ceil(total / pageSize)}
                      className="p-2 bg-[#1E293B] border border-[#334155] rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#048181] transition-colors"
                    >
                      <FiChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}


