'use client';

interface RevenueChartProps {
  data: Array<{ date: string; revenue: number }>;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export default function RevenueChart({ data }: RevenueChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-[#9CA3AF]">
        No data available
      </div>
    );
  }

  const maxRevenue = Math.max(...data.map(d => d.revenue), 1);
  const minRevenue = Math.min(...data.map(d => d.revenue), 0);
  const range = maxRevenue - minRevenue || 1;

  // Calculate points for line
  const points = data.map((item, index) => {
    const x = (index / (data.length - 1 || 1)) * 100;
    const y = 100 - (((item.revenue - minRevenue) / range) * 100);
    return { x, y, ...item };
  });

  return (
    <div className="h-[300px] w-full relative">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="revenueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((y) => (
          <line
            key={y}
            x1="0"
            y1={y}
            x2="100"
            y2={y}
            stroke="#334155"
            strokeWidth="0.5"
            strokeDasharray="1,1"
          />
        ))}
        {/* Area under line */}
        {points.length > 1 && (
          <path
            d={`M ${points.map(p => `${p.x},${p.y}`).join(' L ')} L ${points[points.length - 1].x},100 L 0,100 Z`}
            fill="url(#revenueGradient)"
          />
        )}
        {/* Line */}
        {points.length > 1 && (
          <polyline
            points={points.map(p => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke="#F59E0B"
            strokeWidth="1"
          />
        )}
        {/* Dots */}
        {points.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="1"
            fill="#F59E0B"
          />
        ))}
      </svg>
      <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[#9CA3AF] text-xs px-2">
        {data.map((item, index) => (
          <span
            key={index}
            className="transform -rotate-45 origin-top-left"
            style={{ transform: 'rotate(-45deg)', transformOrigin: 'top left' }}
          >
            {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        ))}
      </div>
      <div className="mt-4 text-center text-[#9CA3AF] text-sm">
        Revenue Trends
      </div>
    </div>
  );
}


