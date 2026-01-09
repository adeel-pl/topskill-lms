'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/app/components/AdminLayout';
import { adminAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import {
  FiBook,
  FiUsers,
  FiDollarSign,
  FiTrendingUp,
  FiArrowUp,
  FiArrowDown,
} from 'react-icons/fi';
import EnrollmentChart from '@/app/components/charts/EnrollmentChart';
import RevenueChart from '@/app/components/charts/RevenueChart';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);
  const [dateRange, setDateRange] = useState('all');

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAnalytics({ date_range: dateRange });
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    // Wait for auth to finish loading before checking permissions
    if (authLoading) return;
    
    // Allow access if user is admin (is_staff) or instructor (has courses)
    if (!isAuthenticated || (!user?.is_staff && !user?.is_instructor)) {
      router.push('/login');
      return;
    }
    loadAnalytics();
  }, [isAuthenticated, user, authLoading, router, loadAnalytics]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#334155] border-t-[#10B981] rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[#9CA3AF]">Loading dashboard...</p>
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

  const { overview, trends, top_courses, payment_stats } = analytics;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const StatCard = ({
    icon: Icon,
    label,
    value,
    change,
    changeType,
    color = '#10B981',
  }: {
    icon: any;
    label: string;
    value: string | number;
    change?: string;
    changeType?: 'up' | 'down';
    color?: string;
  }) => (
    <div className="bg-[#0F172A] border border-[#334155] rounded-xl p-6 hover:border-[#10B981] transition-all duration-300 hover:shadow-lg hover:shadow-[#10B981]/10">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg`} style={{ backgroundColor: `${color}20` }}>
          <Icon className="text-2xl" style={{ color }} />
        </div>
        {change && (
          <div className={`flex items-center gap-1 text-sm ${changeType === 'up' ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
            {changeType === 'up' ? <FiArrowUp /> : <FiArrowDown />}
            <span>{change}</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-[#9CA3AF] text-sm mb-1">{label}</p>
        <p className="text-3xl font-bold text-white">{value}</p>
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-[#9CA3AF]">{overview.date_label}</p>
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
              className="px-4 py-2 bg-gradient-to-r from-[#10B981] to-[#059669] text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-[#10B981]/30 transition-all"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={FiBook}
            label="Total Courses"
            value={overview.total_courses}
            color="#10B981"
          />
          <StatCard
            icon={FiUsers}
            label="Total Students"
            value={overview.total_students}
            color="#3B82F6"
          />
          <StatCard
            icon={FiTrendingUp}
            label="Total Enrollments"
            value={overview.total_enrollments}
            color="#8B5CF6"
          />
          <StatCard
            icon={FiDollarSign}
            label="Total Revenue"
            value={formatCurrency(overview.total_revenue)}
            color="#F59E0B"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Enrollment Trends */}
          <div className="bg-[#0F172A] border border-[#334155] rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-6">Enrollment Trends</h3>
            <EnrollmentChart data={trends.enrollments} />
          </div>

          {/* Revenue Trends */}
          <div className="bg-[#0F172A] border border-[#334155] rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-6">Revenue Trends</h3>
            <RevenueChart data={trends.revenue} />
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#0F172A] border border-[#334155] rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Enrollment Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[#9CA3AF]">Active</span>
                <span className="text-white font-bold">{overview.active_enrollments}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#9CA3AF]">Completed</span>
                <span className="text-white font-bold">{overview.completed_enrollments}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#0F172A] border border-[#334155] rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Payment Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[#9CA3AF]">Paid</span>
                <span className="text-[#10B981] font-bold">{payment_stats.paid}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#9CA3AF]">Pending</span>
                <span className="text-[#F59E0B] font-bold">{payment_stats.pending}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#9CA3AF]">Failed</span>
                <span className="text-[#EF4444] font-bold">{payment_stats.failed}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#0F172A] border border-[#334155] rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Top Courses</h3>
            <div className="space-y-2">
              {top_courses.slice(0, 3).map((course: any, index: number) => (
                <div key={course.id} className="flex items-center justify-between">
                  <span className="text-[#9CA3AF] text-sm truncate flex-1">
                    {index + 1}. {course.title}
                  </span>
                  <span className="text-white font-bold ml-2">{course.enrollment_count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}


