/**
 * ==========================================
 * STAT CARD COMPONENT
 * ==========================================
 * 
 * Displays statistics with gradient background.
 * Used across all dashboards for metrics display.
 */

import React from 'react';
import type { LucideIcon } from 'lucide-react';

// ==========================================
// COMPONENT PROPS
// ==========================================

interface StatCardProps {
  /** Card title/label */
  title: string;
  /** Statistic value */
  value: string | number;
  /** Optional icon to display */
  icon?: LucideIcon;
  /** Optional trend indicator */
  trend?: {
    value: number;
    isPositive: boolean;
  };
  /** Additional CSS classes */
  className?: string;
}

// ==========================================
// STAT CARD COMPONENT
// ==========================================

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  trend,
  className = '' 
}) => {
  return (
    <div className={`stat-card ${className}`}>
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-t-lg" />
      
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-white">{value}</h3>
          
          {/* Trend indicator */}
          {trend && (
            <div className={`flex items-center mt-2 text-sm ${trend.isPositive ? 'text-green-400' : 'text-red-400'}`}>
              <span>{trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%</span>
              <span className="text-gray-500 ml-1">vs last month</span>
            </div>
          )}
        </div>
        
        {/* Icon */}
        {Icon && (
          <div className="p-3 bg-purple-500/20 rounded-lg">
            <Icon className="w-6 h-6 text-purple-400" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
