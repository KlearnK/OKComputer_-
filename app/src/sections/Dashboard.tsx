import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { GoalProgress } from '@/types/goals';
import { 
  Calendar, 
  CalendarDays, 
  Target, 
  CheckCircle2, 
  Award,
  Activity
} from 'lucide-react';

interface DashboardProps {
  progress: GoalProgress;
}

export const Dashboard = ({ progress }: DashboardProps) => {
  const stats = [
    {
      title: '年度目标完成率',
      value: `${progress.annualProgress.toFixed(1)}%`,
      icon: Target,
      color: 'indigo',
      progress: progress.annualProgress,
      description: `${progress.completedAnnualGoals}/${progress.totalAnnualGoals} 个目标`,
    },
    {
      title: '月度目标完成率',
      value: `${progress.monthlyProgress.toFixed(1)}%`,
      icon: Calendar,
      color: 'blue',
      progress: progress.monthlyProgress,
      description: `${progress.completedMonthlyGoals}/${progress.totalMonthlyGoals} 个目标`,
    },
    {
      title: '周目标完成率',
      value: `${progress.weeklyProgress.toFixed(1)}%`,
      icon: CalendarDays,
      color: 'purple',
      progress: progress.weeklyProgress,
      description: `${progress.completedWeeklyGoals}/${progress.totalWeeklyGoals} 个目标`,
    },
  ];

  const colorMap: Record<string, { bg: string; text: string; border: string; progress: string }> = {
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200', progress: 'bg-indigo-600' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', progress: 'bg-blue-600' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200', progress: 'bg-purple-600' },
    green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200', progress: 'bg-green-600' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', progress: 'bg-amber-600' },
  };

  return (
    <div className="space-y-6">
      {/* 统计概览 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => {
          const colors = colorMap[stat.color];
          const Icon = stat.icon;
          
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${colors.text}`} />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                    <p className="text-xs text-slate-500">{stat.description}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">{stat.title}</span>
                    <span className={`font-medium ${colors.text}`}>{stat.progress.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div 
                      className={`${colors.progress} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${stat.progress}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 总体进度 */}
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-800">
            <Activity className="w-5 h-5 text-indigo-600" />
            总体完成进度
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-3">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="8"
                    strokeDasharray={`${progress.annualProgress * 2.51} 251`}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-indigo-600">
                    {progress.annualProgress.toFixed(0)}%
                  </span>
                </div>
              </div>
              <p className="text-sm font-medium text-slate-700">年度目标</p>
              <p className="text-xs text-slate-500">{progress.completedAnnualGoals}/{progress.totalAnnualGoals} 个</p>
            </div>

            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-3">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="8"
                    strokeDasharray={`${progress.monthlyProgress * 2.51} 251`}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-blue-600">
                    {progress.monthlyProgress.toFixed(0)}%
                  </span>
                </div>
              </div>
              <p className="text-sm font-medium text-slate-700">月度目标</p>
              <p className="text-xs text-slate-500">{progress.completedMonthlyGoals}/{progress.totalMonthlyGoals} 个</p>
            </div>

            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-3">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#8b5cf6"
                    strokeWidth="8"
                    strokeDasharray={`${progress.weeklyProgress * 2.51} 251`}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-purple-600">
                    {progress.weeklyProgress.toFixed(0)}%
                  </span>
                </div>
              </div>
              <p className="text-sm font-medium text-slate-700">周目标</p>
              <p className="text-xs text-slate-500">{progress.completedWeeklyGoals}/{progress.totalWeeklyGoals} 个</p>
            </div>
          </div>

          {/* 进度条详情 */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">年度目标进度</span>
                <span className="font-medium text-indigo-600">{progress.annualProgress.toFixed(1)}%</span>
              </div>
              <Progress value={progress.annualProgress} className="h-3 bg-indigo-100" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">月度目标进度</span>
                <span className="font-medium text-blue-600">{progress.monthlyProgress.toFixed(1)}%</span>
              </div>
              <Progress value={progress.monthlyProgress} className="h-3 bg-blue-100" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">周目标进度</span>
                <span className="font-medium text-purple-600">{progress.weeklyProgress.toFixed(1)}%</span>
              </div>
              <Progress value={progress.weeklyProgress} className="h-3 bg-purple-100" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 成就统计 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-slate-800">
              {progress.completedAnnualGoals + progress.completedMonthlyGoals + progress.completedWeeklyGoals}
            </p>
            <p className="text-sm text-slate-500">已完成目标</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-3">
              <Target className="w-6 h-6 text-indigo-600" />
            </div>
            <p className="text-2xl font-bold text-slate-800">
              {progress.totalAnnualGoals + progress.totalMonthlyGoals + progress.totalWeeklyGoals}
            </p>
            <p className="text-sm text-slate-500">总目标数</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3">
              <Award className="w-6 h-6 text-amber-600" />
            </div>
            <p className="text-2xl font-bold text-slate-800">
              {Math.round(
                ((progress.completedAnnualGoals + progress.completedMonthlyGoals + progress.completedWeeklyGoals) /
                (progress.totalAnnualGoals + progress.totalMonthlyGoals + progress.totalWeeklyGoals)) *
                100 || 0
              )}%
            </p>
            <p className="text-sm text-slate-500">总体完成率</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-slate-800">
              {progress.totalWeeklyGoals > 0 ? Math.round((progress.completedWeeklyGoals / progress.totalWeeklyGoals) * 100) : 0}%
            </p>
            <p className="text-sm text-slate-500">周目标达成</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
