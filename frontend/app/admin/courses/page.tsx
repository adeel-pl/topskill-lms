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
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Heading } from '@/app/components/ui/heading';
import { Text } from '@/app/components/ui/text';
import { FormInput } from '@/app/components/ui/form-input';
import { colors } from '@/lib/colors';

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
            <Heading as="h1" size="h1" className="mb-2 text-white">Course Management</Heading>
            <Text variant="muted" className="text-white/70">Manage all courses in the system</Text>
          </div>
          <Button asChild variant="default">
            <Link href="/admin/courses/new">
              <FiPlus /> Create Course
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <Card variant="outlined" className="p-6" style={{ backgroundColor: colors.background.dark, borderColor: colors.border.dark }}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <FormInput
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              icon={<FiSearch className="w-5 h-5" />}
              className="bg-[#1E293B] text-white"
            />
            <select
              value={modality}
              onChange={(e) => {
                setModality(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 rounded-lg text-white focus:outline-none"
              style={{ backgroundColor: '#1E293B', borderColor: colors.border.dark, borderWidth: '1px', borderStyle: 'solid' }}
              onFocus={(e) => e.currentTarget.style.borderColor = colors.primary}
              onBlur={(e) => e.currentTarget.style.borderColor = colors.border.dark}
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
              className="px-4 py-2 rounded-lg text-white focus:outline-none"
              style={{ backgroundColor: '#1E293B', borderColor: colors.border.dark, borderWidth: '1px', borderStyle: 'solid' }}
              onFocus={(e) => e.currentTarget.style.borderColor = colors.primary}
              onBlur={(e) => e.currentTarget.style.borderColor = colors.border.dark}
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
            <Button
              variant="outline"
              onClick={() => {
                setSearch('');
                setModality('');
                setIsActive(null);
                setPage(1);
              }}
              className="text-white border-white/20 hover:border-white/40"
            >
              Clear Filters
            </Button>
          </div>
        </Card>

        {/* Courses Table */}
        <Card variant="outlined" className="overflow-hidden" style={{ backgroundColor: colors.background.dark, borderColor: colors.border.dark }}>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-12 h-12 border-4 rounded-full animate-spin" style={{ borderColor: colors.border.dark, borderTopColor: colors.primary }}></div>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-12">
              <Text variant="muted" className="mb-4 text-white/70">No courses found</Text>
              <Button asChild variant="default">
                <Link href="/admin/courses/new">
                  Create First Course
                </Link>
              </Button>
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
                            <Text className="font-medium text-white">{course.title}</Text>
                            <Text size="sm" variant="muted" className="text-white/70">{course.slug}</Text>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getModalityBadge(course.modality)}`}>
                            {course.modality?.toUpperCase() || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Text className="font-semibold text-white">{formatCurrency(course.price)}</Text>
                        </td>
                        <td className="px-6 py-4">
                          <Text className="text-white">{course.enrollment_count}</Text>
                        </td>
                        <td className="px-6 py-4">
                          <Text className="font-semibold" style={{ color: colors.primary }}>
                            {formatCurrency(course.total_revenue)}
                          </Text>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Text className="font-semibold text-white">{course.rating.toFixed(1)}</Text>
                            <span style={{ color: colors.status.warning }}>⭐</span>
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
                              className="p-2 rounded-lg transition-colors"
                              style={{ backgroundColor: '#1E293B', borderColor: colors.border.dark, borderWidth: '1px', borderStyle: 'solid' }}
                              onMouseEnter={(e) => e.currentTarget.style.borderColor = colors.primary}
                              onMouseLeave={(e) => e.currentTarget.style.borderColor = colors.border.dark}
                              title="Edit"
                            >
                              <FiEdit className="w-4 h-4" style={{ color: colors.primary }} />
                            </Link>
                            <Link
                              href={`/courses/${course.slug}`}
                              target="_blank"
                              className="p-2 rounded-lg transition-colors"
                              style={{ backgroundColor: '#1E293B', borderColor: colors.border.dark, borderWidth: '1px', borderStyle: 'solid' }}
                              onMouseEnter={(e) => e.currentTarget.style.borderColor = colors.status.info}
                              onMouseLeave={(e) => e.currentTarget.style.borderColor = colors.border.dark}
                              title="View"
                            >
                              <FiEye className="w-4 h-4" style={{ color: colors.status.info }} />
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
                <div className="px-6 py-4 flex items-center justify-between" style={{ borderTopColor: colors.border.dark, borderTopWidth: '1px', borderTopStyle: 'solid' }}>
                  <Text size="sm" variant="muted" className="text-white/70">
                    Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total} courses
                  </Text>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                      className="text-white border-white/20 hover:border-white/40"
                    >
                      <FiChevronLeft className="w-5 h-5" />
                    </Button>
                    <Text size="sm" className="px-4 py-2 text-white" style={{ backgroundColor: '#1E293B', borderColor: colors.border.dark, borderWidth: '1px', borderStyle: 'solid', borderRadius: '0.5rem' }}>
                      Page {page} of {Math.ceil(total / pageSize)}
                    </Text>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setPage(page + 1)}
                      disabled={page >= Math.ceil(total / pageSize)}
                      className="text-white border-white/20 hover:border-white/40"
                    >
                      <FiChevronRight className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
}


