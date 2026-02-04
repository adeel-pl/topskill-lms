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
  FiFilter,
  FiCheckCircle,
  FiClock,
  FiXCircle,
} from 'react-icons/fi';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Heading } from '@/app/components/ui/heading';
import { Text } from '@/app/components/ui/text';
import { FormInput } from '@/app/components/ui/form-input';
import { colors } from '@/lib/colors';

export default function AdminPaymentsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    // Wait for auth to finish loading before checking permissions
    if (authLoading) return;
    
    if (!isAuthenticated || !user?.is_staff) {
      router.push('/login');
      return;
    }
    loadPayments();
  }, [isAuthenticated, user, page, search, status, startDate, endDate, authLoading, router]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        page_size: pageSize,
      };
      if (search) params.search = search;
      if (status) params.status = status;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const response = await adminAPI.getPayments(params);
      setPayments(response.data.results);
      setTotal(response.data.count);
    } catch (error) {
      console.error('Error loading payments:', error);
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

  const getStatusBadge = (status: string) => {
    const badges: any = {
      paid: {
        bg: 'bg-green-500/20',
        text: 'text-green-400',
        border: 'border-green-500/30',
        icon: FiCheckCircle,
      },
      initiated: {
        bg: 'bg-yellow-500/20',
        text: 'text-yellow-400',
        border: 'border-yellow-500/30',
        icon: FiClock,
      },
      failed: {
        bg: 'bg-red-500/20',
        text: 'text-red-400',
        border: 'border-red-500/30',
        icon: FiXCircle,
      },
    };
    const badge = badges[status] || badges.initiated;
    const Icon = badge.icon;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${badge.bg} ${badge.text} ${badge.border}`}>
        <Icon className="w-3 h-3" />
        {status.toUpperCase()}
      </span>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Heading as="h1" size="h1" className="mb-2 text-white">Payment Management</Heading>
            <Text variant="muted" className="text-white/70">View and manage all payment transactions</Text>
          </div>
        </div>

        {/* Filters */}
        <Card variant="outlined" className="p-6" style={{ backgroundColor: colors.background.dark, borderColor: colors.border.dark }}>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <FormInput
              type="text"
              placeholder="Search payments..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              icon={<FiSearch className="w-5 h-5" />}
              className="bg-[#1E293B] text-white"
            />
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 rounded-lg text-white focus:outline-none"
              style={{ backgroundColor: '#1E293B', borderColor: colors.border.dark, borderWidth: '1px', borderStyle: 'solid' }}
              onFocus={(e) => e.currentTarget.style.borderColor = colors.primary}
              onBlur={(e) => e.currentTarget.style.borderColor = colors.border.dark}
            >
              <option value="">All Status</option>
              <option value="paid">Paid</option>
              <option value="initiated">Pending</option>
              <option value="failed">Failed</option>
            </select>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 rounded-lg text-white focus:outline-none"
              style={{ backgroundColor: '#1E293B', borderColor: colors.border.dark, borderWidth: '1px', borderStyle: 'solid' }}
              onFocus={(e) => e.currentTarget.style.borderColor = colors.primary}
              onBlur={(e) => e.currentTarget.style.borderColor = colors.border.dark}
              placeholder="Start Date"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 rounded-lg text-white focus:outline-none"
              style={{ backgroundColor: '#1E293B', borderColor: colors.border.dark, borderWidth: '1px', borderStyle: 'solid' }}
              onFocus={(e) => e.currentTarget.style.borderColor = colors.primary}
              onBlur={(e) => e.currentTarget.style.borderColor = colors.border.dark}
              placeholder="End Date"
            />
            <Button
              variant="outline"
              onClick={() => {
                setSearch('');
                setStatus('');
                setStartDate('');
                setEndDate('');
                setPage(1);
              }}
              className="text-white border-white/20 hover:border-white/40"
            >
              Clear Filters
            </Button>
          </div>
        </Card>

        {/* Payments Table */}
        <Card variant="outlined" className="overflow-hidden" style={{ backgroundColor: colors.background.dark, borderColor: colors.border.dark }}>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-12 h-12 border-4 rounded-full animate-spin" style={{ borderColor: colors.border.dark, borderTopColor: colors.primary }}></div>
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-12">
              <Text variant="muted" className="text-white/70">No payments found</Text>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#1E293B] border-b border-[#334155]">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white">Transaction ID</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white">User</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white">Course</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white">Amount</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#334155]">
                    {payments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-[#1E293B]/50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="text-white font-mono text-sm">
                            {payment.payfast_payment_id || `#${payment.id}`}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <Text className="font-medium text-white">{payment.user}</Text>
                            <Text size="sm" variant="muted" className="text-white/70">{payment.user_email}</Text>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Text className="text-white">{payment.course || 'N/A'}</Text>
                        </td>
                        <td className="px-6 py-4">
                          <Text size="lg" className="font-bold" style={{ color: colors.primary }}>
                            {formatCurrency(payment.amount)}
                          </Text>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(payment.status)}
                        </td>
                        <td className="px-6 py-4">
                          <Text size="sm" variant="muted" className="text-white/70">
                            {new Date(payment.created_at).toLocaleString()}
                          </Text>
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
                    Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total} payments
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
        </div>
      </div>
    </AdminLayout>
  );
}


