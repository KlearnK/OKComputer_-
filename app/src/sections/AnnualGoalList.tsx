import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { AnnualGoal } from '@/types/goals';
import { Target, TrendingUp, ShoppingBag, Plane, Award, Edit2, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

interface AnnualGoalListProps {
  goals: AnnualGoal[];
  onEdit: (goal: AnnualGoal) => void;
  onDelete: (id: string) => void;
  onSelectGoal: (goal: AnnualGoal) => void;
  monthlyGoalsCount: (annualGoalId: string) => number;
  weeklyGoalsCount: (annualGoalId: string) => number;
}

export const AnnualGoalList = ({
  goals,
  onEdit,
  onDelete,
  onSelectGoal,
  monthlyGoalsCount,
  weeklyGoalsCount,
}: AnnualGoalListProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (goals.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="py-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
            <Target className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-500 text-sm">暂无年度目标</p>
          <p className="text-slate-400 text-xs mt-1">请先创建年度目标开始规划</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {goals.map((goal) => {
        const monthlyCount = monthlyGoalsCount(goal.id);
        const weeklyCount = weeklyGoalsCount(goal.id);
        const isExpanded = expandedId === goal.id;

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
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                        <Target className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800">
                          {goal.year}年 目标规划
                        </h3>
                        <p className="text-xs text-slate-500">
                          创建于 {new Date(goal.createdAt).toLocaleDateString('zh-CN')}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="bg-green-50 rounded-lg p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          <TrendingUp className="w-3.5 h-3.5 text-green-600" />
                          <span className="text-xs text-green-700 font-medium">收入目标</span>
                        </div>
                        <p className="text-lg font-bold text-green-600">
                          ¥{goal.income.toLocaleString()}
                        </p>
                      </div>

                      <div className="bg-amber-50 rounded-lg p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Award className="w-3.5 h-3.5 text-amber-600" />
                          <span className="text-xs text-amber-700 font-medium">级别目标</span>
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
                        <p className="text-lg font-bold text-blue-600">
                          {goal.orderCount.toLocaleString()}
                        </p>
                      </div>

                      <div className="bg-purple-50 rounded-lg p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          <ShoppingBag className="w-3.5 h-3.5 text-purple-600" />
                          <span className="text-xs text-purple-700 font-medium">零售量</span>
                        </div>
                        <p className="text-lg font-bold text-purple-600">
                          {goal.retailVolume.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {goal.travelGoal && (
                      <div className="mt-3 bg-cyan-50 rounded-lg p-3">
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

                  <div className="flex flex-col items-end gap-2 ml-4">
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectGoal(goal);
                      }}
                      className="text-xs border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                    >
                      查看详情
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate-100">
                  <div className="text-xs text-slate-500">
                    <span className="font-medium">{monthlyCount}</span> 个月度目标
                  </div>
                  <div className="text-xs text-slate-500">
                    <span className="font-medium">{weeklyCount}</span> 个周目标
                  </div>
                  <div className="ml-auto">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="px-5 pb-5 pt-2 bg-slate-50/50 border-t border-slate-100">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <p className="text-xs text-slate-500 mb-1">年度</p>
                      <p className="font-semibold text-slate-800">{goal.year}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <p className="text-xs text-slate-500 mb-1">收入</p>
                      <p className="font-semibold text-green-600">¥{goal.income.toLocaleString()}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <p className="text-xs text-slate-500 mb-1">单量</p>
                      <p className="font-semibold text-blue-600">{goal.orderCount}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <p className="text-xs text-slate-500 mb-1">零售量</p>
                      <p className="font-semibold text-purple-600">{goal.retailVolume}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <p className="text-xs text-slate-500 mb-1">级别</p>
                      <p className="font-semibold text-amber-600 truncate">{goal.level || '-'}</p>
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
