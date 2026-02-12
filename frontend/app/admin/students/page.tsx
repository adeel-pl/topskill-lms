'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/app/components/AdminLayout';
import { adminAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import {
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiMail,
  FiUser,
  FiDollarSign,
  FiCheckCircle,
} from 'react-icons/fi';
import { colors } from '@/lib/colors';

export default function AdminStudentsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [search, setSearch] = useState('');

  useEffect(() => {
    // Wait for auth to finish loading before checking permissions
    if (authLoading) return;
    
    if (!isAuthenticated || !user?.is_staff) {
      router.push('/login');
      return;
    }
    loadStudents();
  }, [isAuthenticated, user, page, search, authLoading, router]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        page_size: pageSize,
      };
      if (search) params.search = search;

      const response = await adminAPI.getStudents(params);
      setStudents(response.data.results);
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Student Management</h1>
            <p style={{ color: colors.text.light }}>Manage all students in the system</p>
          </div>
        </div>

        {/* Search */}
        <div className="rounded-xl p-6" style={{ backgroundColor: colors.background.dark, borderColor: colors.border.dark, borderWidth: '1px', borderStyle: 'solid' }}>
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: colors.text.light }} />
            <input
              type="text"
              placeholder="Search students by name, username, or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 rounded-lg text-white focus:outline-none"
              style={{ backgroundColor: '#1E293B', borderColor: colors.border.dark, borderWidth: '1px', borderStyle: 'solid' }}
              onFocus={(e) => e.currentTarget.style.borderColor = colors.primary}
              onBlur={(e) => e.currentTarget.style.borderColor = colors.border.dark}
            />
          </div>
        </div>

        {/* Students Table */}
        <div className="rounded-xl overflow-hidden" style={{ backgroundColor: colors.background.dark, borderColor: colors.border.dark, borderWidth: '1px', borderStyle: 'solid' }}>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-12 h-12 border-4 rounded-full animate-spin" style={{ borderColor: colors.border.dark, borderTopColor: colors.primary }}></div>
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-12">
              <p style={{ color: colors.text.light }}>No students found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#1E293B] border-b border-[#334155]">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white">Student</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white">Email</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white">Enrollments</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white">Completed</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white">Total Spent</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#334155]">
                    {students.map((student) => (
                      <tr key={student.id} className="hover:bg-[#1E293B]/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: colors.primary }}>
                              <span className="text-white font-bold text-sm">
                                {student.first_name?.charAt(0) || student.username?.charAt(0) || 'U'}
                              </span>
                            </div>
                            <div>
                              <p className="text-white font-medium">
                                {student.first_name && student.last_name
                                  ? `${student.first_name} ${student.last_name}`
                                  : student.username}
                              </p>
                              <p className="text-sm" style={{ color: colors.text.light }}>@{student.username}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2" style={{ color: colors.text.light }}>
                            <FiMail className="w-4 h-4" />
                            <span className="text-sm">{student.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-white">
                            <FiUser className="w-4 h-4" style={{ color: colors.status.info }} />
                            <span className="font-semibold">{student.enrollment_count}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-white">
                            <FiCheckCircle className="w-4 h-4" style={{ color: colors.primary }} />
                            <span className="font-semibold">{student.courses_completed}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold" style={{ color: colors.primary }}>
                          {formatCurrency(student.total_spent)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            student.is_active
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                              : 'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}>
                            {student.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm" style={{ color: colors.text.light }}>
                          {new Date(student.date_joined).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {total > pageSize && (
                <div className="px-6 py-4 border-t border-[#334155] flex items-center justify-between">
                  <p className="text-sm" style={{ color: colors.text.light }}>
                    Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total} students
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                      className="p-2 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      style={{ backgroundColor: '#1E293B', borderColor: colors.border.dark, borderWidth: '1px', borderStyle: 'solid' }}
                      onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.borderColor = colors.primary)}
                      onMouseLeave={(e) => !e.currentTarget.disabled && (e.currentTarget.style.borderColor = colors.border.dark)}
                    >
                      <FiChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="px-4 py-2 rounded-lg text-white" style={{ backgroundColor: '#1E293B', borderColor: colors.border.dark, borderWidth: '1px', borderStyle: 'solid' }}>
                      Page {page} of {Math.ceil(total / pageSize)}
                    </span>
                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={page >= Math.ceil(total / pageSize)}
                      className="p-2 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      style={{ backgroundColor: '#1E293B', borderColor: colors.border.dark, borderWidth: '1px', borderStyle: 'solid' }}
                      onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.borderColor = colors.primary)}
                      onMouseLeave={(e) => !e.currentTarget.disabled && (e.currentTarget.style.borderColor = colors.border.dark)}
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
