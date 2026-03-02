import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { MonthlyGoal, AnnualGoal } from '@/types/goals';
import { Calendar, TrendingUp, ShoppingBag, Plane, Award, Edit2, Trash2, ChevronDown, ChevronUp, Layers } from 'lucide-react';
import { getMonthDisplayName } from '@/utils/dateUtils';

interface MonthlyGoalListProps {
  goals: MonthlyGoal[];
  annualGoals: AnnualGoal[];
  onEdit: (goal: MonthlyGoal) => void;
  onDelete: (id: string) => void;
  onSelectGoal: (goal: MonthlyGoal) => void;
  weeklyGoalsCount: (monthlyGoalId: string) => number;
}

export const MonthlyGoalList = ({
  goals,
  annualGoals,
  onEdit,
  onDelete,
  onSelectGoal,
  weeklyGoalsCount,
}: MonthlyGoalListProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (goals.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="py-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
            <Calendar className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-500 text-sm">暂无明显度目标</p>
          <p className="text-slate-400 text-xs mt-1">请先创建月度目标进行拆解</p>
        </CardContent>
      </Card>
    );
  }

  const getAnnualGoal = (annualGoalId: string) => {
    return annualGoals.find(g => g.id === annualGoalId);
  };

  const calculateProgress = (goal: MonthlyGoal) => {
    const targetSum = goal.income + goal.orderCount + goal.retailVolume;
    const actualSum = (goal.actualIncome || 0) + (goal.actualOrderCount || 0) + (goal.actualRetailVolume || 0);
    return targetSum > 0 ? Math.min((actualSum / targetSum) * 100, 100) : 0;
  };

  return (
    <div className="space-y-4">
      {goals.map((goal) => {
        const annualGoal = getAnnualGoal(goal.annualGoalId);
        const progress = calculateProgress(goal);
        const isExpanded = expandedId === goal.id;
        const weeklyCount = weeklyGoalsCount(goal.id);

        return (
          <Card
            key={goal.id}
            className="w-full overflow-hidden hover:shadow-lg transition-all duration-300 group"
          >
            <CardContent className="p-0">
              <div
                className="p-5 cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => setExpandedId(isExpanded ? null : goal.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">
                        {getMonthDisplayName(goal.monthISO)}
                      </h3>
                      {annualGoal && (
                        <p className="text-xs text-slate-500">
                          所属: {annualGoal.year}年目标
                        </p>
                      )}
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
                      <span className="text-xs font-medium text-indigo-600">{progress.toFixed(1)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
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
                  <div className="flex items-center gap-4">
                    <div className="text-xs text-slate-500 flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5" />
                      <span className="font-medium">{weeklyCount}</span> 个周目标
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectGoal(goal);
                    }}
                    className="text-xs border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                  >
                    查看周目标
                  </Button>

                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 ml-2" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 ml-2" />
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="px-5 pb-5 pt-2 bg-slate-50/50 border-t border-slate-100">
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                    <div className="bg-white rounded-lg p-3 shadow-sm text-center">
                      <p className="text-xs text-slate-500 mb-1">年度</p>
                      <p className="font-semibold text-slate-800">{goal.year}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm text-center">
                      <p className="text-xs text-slate-500 mb-1">月份</p>
                      <p className="font-semibold text-indigo-600">{getMonthDisplayName(goal.monthISO)}</p>
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
                      <p className="text-xs text-slate-500 mb-1">零售量</p>
                      <p className="font-semibold text-purple-600">{goal.retailVolume}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm text-center">
                      <p className="text-xs text-slate-500 mb-1">进度</p>
                      <p className="font-semibold text-indigo-600">{progress.toFixed(0)}%</p>
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
