'use client';

interface EnrollmentChartProps {
  data: Array<{ date: string; count: number }>;
}

export default function EnrollmentChart({ data }: EnrollmentChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-[#9CA3AF]">
        No data available
      </div>
    );
  }

  const maxCount = Math.max(...data.map(d => d.count), 1);
  const minCount = Math.min(...data.map(d => d.count), 0);
  const range = maxCount - minCount || 1;

  return (
    <div className="h-[300px] w-full">
      <div className="h-full flex items-end justify-between gap-1">
        {data.map((item, index) => {
          const height = ((item.count - minCount) / range) * 100;
          return (
            <div key={index} className="flex-1 flex flex-col items-center justify-end gap-1">
              <div
                className="w-full bg-gradient-to-t bg-[#366854] rounded-t transition-all duration-300 hover:opacity-80"
                style={{ height: `${Math.max(height, 5)}%` }}
                title={`${item.date}: ${item.count} enrollments`}
              />
              <span className="text-[#9CA3AF] text-xs transform -rotate-45 origin-top-left whitespace-nowrap">
                {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-4 text-center text-[#9CA3AF] text-sm">
        Enrollment Trends
      </div>
    </div>
  );
}


