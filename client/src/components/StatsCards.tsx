import { Link2, MousePointer2, CheckCircle, Clock } from 'lucide-react';
import { cn } from '../lib/utils.js';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'yellow' | 'red';
  href?: string;
}

function StatCard({ title, value, icon, color, href }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    green: 'bg-green-500 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800',
    yellow: 'bg-yellow-500 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
    red: 'bg-red-500 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800',
  };

  const iconBg = colorClasses[color];
  const iconText = colorClasses[color].replace('bg-', 'text-');

  const Content = () => (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
        </div>
        <div className={cn('p-3 rounded-xl', iconBg)}>
          <span className={cn(iconText)}>{icon}</span>
        </div>
      </div>
      {href && (
        <a href={href} className="mt-4 inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline">
          View details <span aria-hidden="true">→</span>
        </a>
      )}
    </div>
  );

  return href ? (
    <a href={href} className="block hover:shadow-md transition-shadow">
      <Content />
    </a>
  ) : (
    <Content />
  );
}

export function StatsCards({ stats }: { stats: { totalUrls: number; totalClicks: number; activeUrls: number; expiredUrls: number } }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard
        title="Total URLs"
        value={stats.totalUrls.toLocaleString()}
        icon={<Link2 className="h-6 w-6" />}
        color="blue"
      />
      <StatCard
        title="Total Clicks"
        value={stats.totalClicks.toLocaleString()}
        icon={<MousePointer2 className="h-6 w-6" />}
        color="green"
      />
      <StatCard
        title="Active URLs"
        value={stats.activeUrls.toLocaleString()}
        icon={<CheckCircle className="h-6 w-6" />}
        color="yellow"
      />
      <StatCard
        title="Expired URLs"
        value={stats.expiredUrls.toLocaleString()}
        icon={<Clock className="h-6 w-6" />}
        color="red"
      />
    </div>
  );
}