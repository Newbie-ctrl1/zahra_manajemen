import { formatCurrency } from '@/lib/reportUtils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  bgColor?: string;
}

export default function StatsCard({ title, value, icon, bgColor = 'bg-blue-600' }: StatsCardProps) {
  const displayValue = typeof value === 'number' ? formatCurrency(value) : value;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{displayValue}</p>
        </div>
        {icon && (
          <div className={`${bgColor} p-3 rounded-full text-white`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
