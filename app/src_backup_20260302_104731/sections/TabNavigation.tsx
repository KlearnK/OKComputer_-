import { Button } from '@/components/ui/button';
import { Target, Calendar, CalendarDays, LayoutDashboard } from 'lucide-react';

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'dashboard', label: '数据看板', icon: LayoutDashboard },
  { id: 'annual', label: '年度目标', icon: Target },
  { id: 'monthly', label: '月度目标', icon: Calendar },
  { id: 'weekly', label: '周目标', icon: CalendarDays },
];

export const TabNavigation = ({ activeTab, onTabChange }: TabNavigationProps) => {
  return (
    <div className="flex flex-wrap gap-2 p-2 bg-slate-100 rounded-xl">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <Button
            key={tab.id}
            variant={isActive ? 'default' : 'ghost'}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
              ${isActive 
                ? 'bg-indigo-600 text-white shadow-md hover:bg-indigo-700' 
                : 'text-slate-600 hover:bg-white hover:text-slate-800 hover:shadow-sm'
              }
            `}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </Button>
        );
      })}
    </div>
  );
};
