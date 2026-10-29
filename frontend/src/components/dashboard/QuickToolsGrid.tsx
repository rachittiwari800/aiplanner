import React from 'react';
import { Sparkles, MessageSquare, Wallet, CheckSquare } from 'lucide-react';
import { Card } from '../ui/Card';
import { useUIStore } from '../../store/useUIStore';

const tools = [
  {
    id: 'planner',
    title: 'AI Trip Planner',
    description: 'Generate personalized itineraries with AI',
    icon: Sparkles,
    color: 'bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400',
  },
  {
    id: 'chat',
    title: 'AI Chat Assistant',
    description: 'Modify your trips using natural chat',
    icon: MessageSquare,
    color: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400',
  },
  {
    id: 'budget',
    title: 'Budget Planner',
    description: 'Plan your budget smartly',
    icon: Wallet,
    color: 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400',
  },
  {
    id: 'packing',
    title: 'Packing List',
    description: 'Get AI-powered packing checklist',
    icon: CheckSquare,
    color: 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400',
  },
];

export const QuickToolsGrid: React.FC = () => {
  const { setActiveTab } = useUIStore();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {tools.map((tool) => {
        const Icon = tool.icon;
        return (
          <Card
            key={tool.id}
            onClick={() => setActiveTab(tool.id)}
            className="cursor-pointer flex items-center gap-4 p-4 hover:scale-[1.02] transition-transform"
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${tool.color}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                {tool.title}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                {tool.description}
              </p>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
