'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/app/components/AdminLayout';
import { adminAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import EnrollmentChart from '@/app/components/charts/EnrollmentChart';
import RevenueChart from '@/app/components/charts/RevenueChart';

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);
  const [dateRange, setDateRange] = useState('all');

  useEffect(() => {
    // Wait for auth to finish loading before checking permissions
    if (authLoading) return;
    
    if (!isAuthenticated || !user?.is_staff) {
      router.push('/login');
      return;
    }
    loadAnalytics();
  }, [isAuthenticated, user, dateRange, authLoading, router]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAnalytics({ date_range: dateRange });
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#334155] border-t-[#10B981] rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[#9CA3AF]">Loading analytics...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!analytics) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-[#9CA3AF]">No data available</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Advanced Analytics</h1>
            <p className="text-[#9CA3AF]">Detailed insights and reports</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-[#0F172A] border border-[#334155] text-white rounded-lg px-4 py-2 focus:outline-none focus:border-[#10B981]"
            >
              <option value="all">All Time</option>
              <option value="1day">Last 24 Hours</option>
              <option value="1week">Last 7 Days</option>
              <option value="1month">Last 30 Days</option>
            </select>
            <button
              onClick={loadAnalytics}
              className="px-4 py-2 bg-[#10B981] text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-[#10B981]/30 transition-all"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Enrollment Trends */}
          <div className="bg-[#0F172A] border border-[#334155] rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-6">Enrollment Trends</h3>
            <EnrollmentChart data={analytics.trends.enrollments} />
          </div>

          {/* Revenue Trends */}
          <div className="bg-[#0F172A] border border-[#334155] rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-6">Revenue Trends</h3>
            <RevenueChart data={analytics.trends.revenue} />
          </div>

          {/* Top Courses Bar Chart */}
          <div className="bg-[#0F172A] border border-[#334155] rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-6">Top Courses by Enrollment</h3>
            <div className="h-[300px] w-full">
              <div className="h-full flex items-end justify-between gap-2">
                {analytics.top_courses.slice(0, 5).map((course: any, index: number) => {
                  const maxEnroll = Math.max(...analytics.top_courses.slice(0, 5).map((c: any) => c.enrollment_count), 1);
                  const height = (course.enrollment_count / maxEnroll) * 100;
                  return (
                    <div key={course.id} className="flex-1 flex flex-col items-center justify-end gap-2">
                      <div
                        className="w-full bg-gradient-to-t bg-[#10B981] rounded-t transition-all duration-300 hover:opacity-80"
                        style={{ height: `${Math.max(height, 5)}%` }}
                        title={`${course.title}: ${course.enrollment_count} enrollments`}
                      />
                      <span className="text-[#9CA3AF] text-xs text-center px-1">
                        {course.title.length > 15 ? course.title.substring(0, 15) + '...' : course.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Course Modality Distribution */}
          <div className="bg-[#0F172A] border border-[#334155] rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-6">Courses by Modality</h3>
            <div className="h-[300px] flex items-center justify-center">
              <div className="grid grid-cols-2 gap-4 w-full">
                {analytics.course_by_modality.map((item: any, index: number) => {
                  const total = analytics.course_by_modality.reduce((sum: number, i: any) => sum + i.count, 0);
                  const percent = total > 0 ? (item.count / total) * 100 : 0;
                  const colors = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444'];
                  return (
                    <div key={index} className="text-center">
                      <div className="relative w-32 h-32 mx-auto mb-2">
                        <svg className="transform -rotate-90" width="128" height="128">
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="#334155"
                            strokeWidth="12"
                            fill="none"
                          />
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke={colors[index % colors.length]}
                            strokeWidth="12"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 56}`}
                            strokeDashoffset={`${2 * Math.PI * 56 * (1 - percent / 100)}`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-white font-bold text-lg">{percent.toFixed(0)}%</span>
                        </div>
                      </div>
                      <p className="text-[#9CA3AF] text-sm">{item.modality || 'Unknown'}</p>
                      <p className="text-white font-semibold">{item.count} courses</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Top Courses Table */}
        <div className="bg-[#0F172A] border border-[#334155] rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-6">Top 10 Courses</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#1E293B] border-b border-[#334155]">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white">Rank</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white">Course</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white">Enrollments</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white">Revenue</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#334155]">
                {analytics.top_courses.map((course: any, index: number) => (
                  <tr key={course.id} className="hover:bg-[#1E293B]/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-[#10B981] font-bold text-lg">#{index + 1}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-white font-medium">{course.title}</p>
                    </td>
                    <td className="px-4 py-3 text-white">{course.enrollment_count}</td>
                    <td className="px-4 py-3 text-[#10B981] font-semibold">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      }).format(course.revenue)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-semibold">{course.rating.toFixed(1)}</span>
                        <span className="text-[#F59E0B]">⭐</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}


