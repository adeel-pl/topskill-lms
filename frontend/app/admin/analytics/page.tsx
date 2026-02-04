'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/app/components/AdminLayout';
import { adminAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import EnrollmentChart from '@/app/components/charts/EnrollmentChart';
import RevenueChart from '@/app/components/charts/RevenueChart';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Heading } from '@/app/components/ui/heading';
import { Text } from '@/app/components/ui/text';
import { colors } from '@/lib/colors';

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
            <div className="w-16 h-16 border-4 rounded-full animate-spin mx-auto mb-4" style={{ borderColor: colors.border.dark, borderTopColor: colors.primary }}></div>
            <Text variant="muted">Loading analytics...</Text>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!analytics) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <Text variant="muted">No data available</Text>
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
            <Heading as="h1" size="h1" className="mb-2 text-white">Advanced Analytics</Heading>
            <Text variant="muted" className="text-white/70">Detailed insights and reports</Text>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="rounded-lg px-4 py-2 text-white focus:outline-none"
              style={{ backgroundColor: colors.background.dark, borderColor: colors.border.dark, borderWidth: '1px', borderStyle: 'solid' }}
              onFocus={(e) => e.currentTarget.style.borderColor = colors.primary}
              onBlur={(e) => e.currentTarget.style.borderColor = colors.border.dark}
            >
              <option value="all">All Time</option>
              <option value="1day">Last 24 Hours</option>
              <option value="1week">Last 7 Days</option>
              <option value="1month">Last 30 Days</option>
            </select>
            <Button onClick={loadAnalytics} variant="default">
              Refresh
            </Button>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Enrollment Trends */}
          <Card variant="outlined" className="p-6" style={{ backgroundColor: colors.background.dark, borderColor: colors.border.dark }}>
            <Heading as="h3" size="h3" className="mb-6 text-white">Enrollment Trends</Heading>
            <EnrollmentChart data={analytics.trends.enrollments} />
          </Card>

          {/* Revenue Trends */}
          <Card variant="outlined" className="p-6" style={{ backgroundColor: colors.background.dark, borderColor: colors.border.dark }}>
            <Heading as="h3" size="h3" className="mb-6 text-white">Revenue Trends</Heading>
            <RevenueChart data={analytics.trends.revenue} />
          </Card>

          {/* Top Courses Bar Chart */}
          <Card variant="outlined" className="p-6" style={{ backgroundColor: colors.background.dark, borderColor: colors.border.dark }}>
            <Heading as="h3" size="h3" className="mb-6 text-white">Top Courses by Enrollment</Heading>
            <div className="h-[300px] w-full">
              <div className="h-full flex items-end justify-between gap-2">
                {analytics.top_courses.slice(0, 5).map((course: any, index: number) => {
                  const maxEnroll = Math.max(...analytics.top_courses.slice(0, 5).map((c: any) => c.enrollment_count), 1);
                  const height = (course.enrollment_count / maxEnroll) * 100;
                  return (
                    <div key={course.id} className="flex-1 flex flex-col items-center justify-end gap-2">
                      <div
                        className="w-full bg-gradient-to-t bg-[#048181] rounded-t transition-all duration-300 hover:opacity-80"
                        style={{ height: `${Math.max(height, 5)}%` }}
                        title={`${course.title}: ${course.enrollment_count} enrollments`}
                      />
                      <Text size="xs" variant="muted" className="text-center px-1 text-white/70">
                        {course.title.length > 15 ? course.title.substring(0, 15) + '...' : course.title}
                      </Text>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>

          {/* Course Modality Distribution */}
          <Card variant="outlined" className="p-6" style={{ backgroundColor: colors.background.dark, borderColor: colors.border.dark }}>
            <Heading as="h3" size="h3" className="mb-6 text-white">Courses by Modality</Heading>
            <div className="h-[300px] flex items-center justify-center">
              <div className="grid grid-cols-2 gap-4 w-full">
                {analytics.course_by_modality.map((item: any, index: number) => {
                  const total = analytics.course_by_modality.reduce((sum: number, i: any) => sum + i.count, 0);
                  const percent = total > 0 ? (item.count / total) * 100 : 0;
                  const chartColors = [colors.primary, colors.status.info, '#8B5CF6', colors.status.warning, colors.status.error];
                  return (
                    <div key={index} className="text-center">
                      <div className="relative w-32 h-32 mx-auto mb-2">
                        <svg className="transform -rotate-90" width="128" height="128">
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke={colors.border.dark}
                            strokeWidth="12"
                            fill="none"
                          />
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke={chartColors[index % chartColors.length]}
                            strokeWidth="12"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 56}`}
                            strokeDashoffset={`${2 * Math.PI * 56 * (1 - percent / 100)}`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Text size="lg" className="font-bold text-white">{percent.toFixed(0)}%</Text>
                        </div>
                      </div>
                      <Text size="sm" variant="muted" className="text-white/70">{item.modality || 'Unknown'}</Text>
                      <Text className="font-semibold text-white">{item.count} courses</Text>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>

        {/* Top Courses Table */}
        <Card variant="outlined" className="p-6" style={{ backgroundColor: colors.background.dark, borderColor: colors.border.dark }}>
          <Heading as="h3" size="h3" className="mb-6 text-white">Top 10 Courses</Heading>
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
                      <Text size="lg" className="font-bold" style={{ color: colors.primary }}>#{index + 1}</Text>
                    </td>
                    <td className="px-4 py-3">
                      <Text className="font-medium text-white">{course.title}</Text>
                    </td>
                    <td className="px-4 py-3">
                      <Text className="text-white">{course.enrollment_count}</Text>
                    </td>
                    <td className="px-4 py-3">
                      <Text className="font-semibold" style={{ color: colors.primary }}>
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                        }).format(course.revenue)}
                      </Text>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Text className="font-semibold text-white">{course.rating.toFixed(1)}</Text>
                        <span style={{ color: colors.status.warning }}>⭐</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}


