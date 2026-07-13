import React from 'react';
import { motion } from 'motion/react';
import { Card } from './Card';
import { AnimatedNumber } from './AnimatedNumber';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  delay?: number;
  suffix?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
  color = 'blue',
  delay = 0,
  suffix = ''
}) => {
  const colorStyles = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
    red: 'from-red-500 to-red-600'
  };

  const bgGradient = `bg-gradient-to-br ${colorStyles[color]}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card hover className="relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              {title}
            </p>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              <AnimatedNumber value={value} duration={1.5} />
            </h3>
            {description && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {description}
              </p>
            )}
            {trend && (
              <div className="flex items-center gap-1 mt-2">
                <span className={`text-sm font-semibold ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {trend.isPositive ? '+' : ''}{trend.value}%
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  from last month
                </span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-xl ${bgGradient} bg-opacity-10`}>
            <Icon className={`w-6 h-6 text-${color === 'blue' ? 'blue' : color === 'green' ? 'green' : color === 'purple' ? 'purple' : color === 'orange' ? 'orange' : 'red'}-600`} />
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
