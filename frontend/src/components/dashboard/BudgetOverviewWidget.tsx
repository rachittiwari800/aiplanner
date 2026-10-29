import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ArrowRight } from 'lucide-react';
import { Card } from '../ui/Card';
import { useUIStore } from '../../store/useUIStore';
import { usePlannerStore } from '../../store/usePlannerStore';
import { tripService } from '../../services/tripService';
import type { Trip } from '../../types';

export const BudgetOverviewWidget: React.FC = () => {
  const { setActiveTab } = useUIStore();
  const { formData } = usePlannerStore();
  const [latestTrip, setLatestTrip] = useState<Trip | null>(null);

  useEffect(() => {
    tripService
      .getUserTrips()
      .then((res) => {
        if (res.data?.trips?.length) {
          setLatestTrip(res.data.trips[0]);
        }
      })
      .catch(() => {});
  }, []);

  const currency = latestTrip?.budget.currency || formData.currency || 'INR';

  const chartData = latestTrip
    ? [
        { name: 'Flights', value: latestTrip.budget.categories.flights || 0, color: '#7c3aed' },
        { name: 'Hotels', value: latestTrip.budget.categories.hotels || 0, color: '#6366f1' },
        { name: 'Food', value: latestTrip.budget.categories.food || 0, color: '#10b981' },
        { name: 'Activities', value: latestTrip.budget.categories.activities || 0, color: '#f59e0b' },
        { name: 'Other', value: latestTrip.budget.categories.other || 0, color: '#ec4899' },
      ].filter((item) => item.value > 0)
    : [
        { name: 'Flights', value: Math.round(formData.budgetAmount * 0.35), color: '#7c3aed' },
        { name: 'Hotels', value: Math.round(formData.budgetAmount * 0.35), color: '#6366f1' },
        { name: 'Food', value: Math.round(formData.budgetAmount * 0.15), color: '#10b981' },
        { name: 'Activities', value: Math.round(formData.budgetAmount * 0.10), color: '#f59e0b' },
        { name: 'Other', value: Math.round(formData.budgetAmount * 0.05), color: '#ec4899' },
      ];

  const totalBudget = chartData.reduce((sum, item) => sum + item.value, 0);
  const titleDestination = latestTrip?.destination || formData.destination || 'Planning Budget';

  return (
    <Card className="h-full flex flex-col justify-between p-5">
      <div>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Budget Overview</h2>
            <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
              {latestTrip ? `Active: ${titleDestination}` : `Draft: ${titleDestination}`}
            </p>
          </div>
          <span className="px-2.5 py-1 text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg">
            {currency}
          </span>
        </div>

        {/* Donut Pie Chart Container with centered Total Label */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center my-2">
          <div className="relative w-full h-44 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={72}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => `${currency} ${Number(val).toLocaleString()}`}
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-base font-extrabold text-gray-900 dark:text-white leading-tight">
                {totalBudget.toLocaleString()}
              </span>
              <span className="text-[10px] text-gray-400 font-medium uppercase">{currency} Total</span>
            </div>
          </div>

          {/* Legend Items Column */}
          <div className="space-y-2">
            {chartData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-gray-600 dark:text-gray-300 font-medium">{item.name}</span>
                </div>
                <span className="font-bold text-gray-900 dark:text-white">
                  {currency} {item.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-gray-100 dark:border-gray-800 text-center">
        <button
          onClick={() => setActiveTab('budget')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
        >
          <span>Open Full Budget Planner</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </Card>
  );
};
