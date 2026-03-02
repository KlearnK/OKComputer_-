import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { WeeklyGoal, MonthlyGoal } from '@/types/goals';
import { CalendarDays, TrendingUp, ShoppingBag, Plane, Award, Edit2, Trash2, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import { getWeekDisplayName, getMonthDisplayName } from '@/utils/dateUtils';

interface WeeklyGoalListProps {
  goals: WeeklyGoal[];
  monthlyGoals: MonthlyGoal[];
  onEdit: (goal: WeeklyGoal) => void;
  onDelete: (id: string) => void;
  onUpdateActual: (id: string, field: string, value: number) => void;
}

export const WeeklyGoalList = ({
  goals,
  monthlyGoals,
  onEdit,
  onDelete,
  onUpdateActual,
}: WeeklyGoalListProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (goals.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="py-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
            <CalendarDays className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-500 text-sm">暂无周目标</p>
          <p className="text-slate-400 text-xs mt-1">请先创建周目标进行细化</p>
        </CardContent>
      </Card>
    );
  }

  const getMonthlyGoal = (monthlyGoalId: string) => {
    return monthlyGoals.find(g => g.id === monthlyGoalId);
  };

  const calculateProgress = (goal: WeeklyGoal) => {
    const targetSum = goal.income + goal.orderCount + goal.retailVolume;
    const actualSum = (goal.actualIncome || 0) + (goal.actualOrderCount || 0) + (goal.actualRetailVolume || 0);
    return targetSum > 0 ? Math.min((actualSum / targetSum) * 100, 100) : 0;
  };

  return (
    <div className="space-y-4">
      {goals.map((goal) => {
        const monthlyGoal = getMonthlyGoal(goal.monthlyGoalId);
        const progress = calculateProgress(goal);
        const isExpanded = expandedId === goal.id;
        const isCompleted = progress >= 100;

        return (
          <Card
            key={goal.id}
            className={`w-full overflow-hidden hover:shadow-lg transition-all duration-300 group ${
              isCompleted ? 'ring-2 ring-green-200 bg-green-50/30' : ''
            }`}
          >
            <CardContent className="p-0">
              <div
                className="p-5 cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => setExpandedId(isExpanded ? null : goal.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isCompleted 
                        ? 'bg-green-100' 
                        : 'bg-gradient-to-br from-indigo-100 to-purple-100'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <CalendarDays className="w-5 h-5 text-indigo-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                        {getWeekDisplayName(goal.weekISO)}
                        {isCompleted && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-normal">
                            已完成
                          </span>
                        )}
                      </h3>
                      {monthlyGoal && (
                        <p className="text-xs text-slate-500">
                          所属: {getMonthDisplayName(monthlyGoal.monthISO)}
                        </p>
                      )}
                      <p className="text-xs text-slate-400">
                        ISO8601: {goal.weekISO}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(goal);
                      }}
                      className="h-8 w-8 p-0 text-slate-500 hover:text-indigo-600"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(goal.id);
                      }}
                      className="h-8 w-8 p-0 text-slate-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-slate-500">整体进度</span>
                      <span className={`text-xs font-medium ${
                        isCompleted ? 'text-green-600' : 'text-indigo-600'
                      }`}>
                        {progress.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={progress} className={`h-2 ${
                      isCompleted ? 'bg-green-200' : ''
                    }`} />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-green-50 rounded-lg p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <TrendingUp className="w-3.5 h-3.5 text-green-600" />
                        <span className="text-xs text-green-700 font-medium">收入</span>
                      </div>
                      <p className="text-sm font-semibold text-green-600">
                        ¥{goal.income.toLocaleString()}
                      </p>
                      {goal.actualIncome !== undefined && (
                        <p className="text-xs text-green-500 mt-1">
                          实际: ¥{goal.actualIncome.toLocaleString()}
                        </p>
                      )}
                    </div>

                    <div className="bg-amber-50 rounded-lg p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Award className="w-3.5 h-3.5 text-amber-600" />
                        <span className="text-xs text-amber-700 font-medium">级别</span>
                      </div>
                      <p className="text-sm font-semibold text-amber-600 truncate">
                        {goal.level || '未设置'}
                      </p>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />
                        <span className="text-xs text-blue-700 font-medium">单量</span>
                      </div>
                      <p className="text-sm font-semibold text-blue-600">
                        {goal.orderCount.toLocaleString()}
                      </p>
                      {goal.actualOrderCount !== undefined && (
                        <p className="text-xs text-blue-500 mt-1">
                          实际: {goal.actualOrderCount}
                        </p>
                      )}
                    </div>

                    <div className="bg-purple-50 rounded-lg p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <ShoppingBag className="w-3.5 h-3.5 text-purple-600" />
                        <span className="text-xs text-purple-700 font-medium">零售量</span>
                      </div>
                      <p className="text-sm font-semibold text-purple-600">
                        {goal.retailVolume.toLocaleString()}
                      </p>
                      {goal.actualRetailVolume !== undefined && (
                        <p className="text-xs text-purple-500 mt-1">
                          实际: {goal.actualRetailVolume}
                        </p>
                      )}
                    </div>
                  </div>

                  {goal.travelGoal && (
                    <div className="bg-cyan-50 rounded-lg p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Plane className="w-3.5 h-3.5 text-cyan-600" />
                        <span className="text-xs text-cyan-700 font-medium">旅游目标</span>
                      </div>
                      <p className="text-sm text-cyan-600 line-clamp-2">
                        {goal.travelGoal}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                  <div className="text-xs text-slate-500">
                    ISO8601周次: <span className="font-medium">{goal.weekISO}</span>
                  </div>

                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="px-5 pb-5 pt-2 bg-slate-50/50 border-t border-slate-100">
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-4">
                    <div className="bg-white rounded-lg p-3 shadow-sm text-center">
                      <p className="text-xs text-slate-500 mb-1">年度</p>
                      <p className="font-semibold text-slate-800">{goal.year}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm text-center">
                      <p className="text-xs text-slate-500 mb-1">月份</p>
                      <p className="font-semibold text-indigo-600">{goal.month}月</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm text-center">
                      <p className="text-xs text-slate-500 mb-1">周次</p>
                      <p className="font-semibold text-purple-600">第{goal.week}周</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm text-center">
                      <p className="text-xs text-slate-500 mb-1">收入</p>
                      <p className="font-semibold text-green-600">¥{goal.income.toLocaleString()}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm text-center">
                      <p className="text-xs text-slate-500 mb-1">单量</p>
                      <p className="font-semibold text-blue-600">{goal.orderCount}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm text-center">
                      <p className="text-xs text-slate-500 mb-1">进度</p>
                      <p className="font-semibold text-indigo-600">{progress.toFixed(0)}%</p>
                    </div>
                  </div>

                  {/* 实际完成数据输入 */}
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      更新实际完成数据
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs text-slate-500">实际收入</Label>
                        <Input
                          type="number"
                          placeholder="实际收入"
                          value={goal.actualIncome || ''}
                          onChange={(e) => onUpdateActual(goal.id, 'actualIncome', parseInt(e.target.value) || 0)}
                          className="border-slate-200 focus:border-green-500 text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-slate-500">实际单量</Label>
                        <Input
                          type="number"
                          placeholder="实际单量"
                          value={goal.actualOrderCount || ''}
                          onChange={(e) => onUpdateActual(goal.id, 'actualOrderCount', parseInt(e.target.value) || 0)}
                          className="border-slate-200 focus:border-blue-500 text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-slate-500">实际零售量</Label>
                        <Input
                          type="number"
                          placeholder="实际零售量"
                          value={goal.actualRetailVolume || ''}
                          onChange={(e) => onUpdateActual(goal.id, 'actualRetailVolume', parseInt(e.target.value) || 0)}
                          className="border-slate-200 focus:border-purple-500 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
