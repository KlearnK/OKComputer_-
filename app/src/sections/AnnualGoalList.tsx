import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { AnnualGoal } from '@/types/goals';
import { 
  Target, 
  TrendingUp, 
  Edit2, 
  Trash2, 
  ChevronDown, 
  ChevronUp,
  Edit3,
  Users
} from 'lucide-react';
import { ActualUpdateModal } from './ActualUpdateModal';

interface AnnualGoalListProps {
  goals: AnnualGoal[];
  onEdit: (goal: AnnualGoal) => void;
  onDelete: (id: string) => void;
  onSelectGoal: (goal: AnnualGoal) => void;
  onUpdateActual?: (id: string, actualBreakdown: any, actualExecution: any) => void;
  monthlyGoalsCount: (annualGoalId: string) => number;
  weeklyGoalsCount: (annualGoalId: string) => number;
}

// 计算拆解进度
const calculateBreakdownProgress = (goal: AnnualGoal) => {
  const target = (goal.breakdownGoals?.income || 0) + (goal.breakdownGoals?.orderCount || 0) + (goal.breakdownGoals?.retailVolume || 0);
  const actual = (goal.actualBreakdown?.income || 0) + (goal.actualBreakdown?.orderCount || 0) + (goal.actualBreakdown?.retailVolume || 0);
  return target > 0 ? Math.min((actual / target) * 100, 100) : 0;
};

// 计算执行进度
const calculateExecutionProgress = (goal: AnnualGoal) => {
  const target = (goal.executionGoals?.newLeads || 0) + (goal.executionGoals?.visitCount || 0) + (goal.executionGoals?.new5ALeads || 0) + 
                 (goal.executionGoals?.visit5ACount || 0) + (goal.executionGoals?.salonInviteCount || 0) + (goal.executionGoals?.引流CardCount || 0);
  const actual = (goal.actualExecution?.newLeads || 0) + (goal.actualExecution?.visitCount || 0) + 
                 (goal.actualExecution?.new5ALeads || 0) + (goal.actualExecution?.visit5ACount || 0) +
                 (goal.actualExecution?.salonInviteCount || 0) + (goal.actualExecution?.引流CardCount || 0);
  return target > 0 ? Math.min((actual / target) * 100, 100) : 0;
};

export const AnnualGoalList = ({
  goals,
  onEdit,
  onDelete,
  onSelectGoal,
  onUpdateActual,
  monthlyGoalsCount,
  weeklyGoalsCount,
}: AnnualGoalListProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isActualModalOpen, setIsActualModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<AnnualGoal | null>(null);

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

  const handleOpenActual = (goal: AnnualGoal) => {
    setSelectedGoal(goal);
    setIsActualModalOpen(true);
  };

  const handleUpdateActual = (actualBreakdown: any, actualExecution: any) => {
    if (selectedGoal && onUpdateActual) {
      onUpdateActual(selectedGoal.id, actualBreakdown, actualExecution);
    }
    setIsActualModalOpen(false);
    setSelectedGoal(null);
  };

  // 构建完整的 goal 对象传递给 ActualUpdateModal
  const buildModalGoal = (goal: AnnualGoal | null) => {
    if (!goal) return null;
    
    return {
      id: goal.id,
      memberId: goal.memberId || '',
      year: goal.year,
      month: 0,
      monthISO: `${goal.year}-01`,
      week: 0,
      weekISO: `${goal.year}-W01`,
      weekStartDate: '',
      weekEndDate: '',
      breakdownGoals: {
        income: goal.breakdownGoals?.income || 0,
        level: goal.breakdownGoals?.level || '',
        orderCount: goal.breakdownGoals?.orderCount || 0,
        retailVolume: goal.breakdownGoals?.retailVolume || 0,
        travelGoal: goal.breakdownGoals?.travelGoal || '',
      },
      executionGoals: {
        newLeads: goal.executionGoals?.newLeads || 0,
        visitCount: goal.executionGoals?.visitCount || 0,
        new5ALeads: goal.executionGoals?.new5ALeads || 0,
        visit5ACount: goal.executionGoals?.visit5ACount || 0,
        salonInviteCount: goal.executionGoals?.salonInviteCount || 0,
        引流CardCount: goal.executionGoals?.引流CardCount || 0,
      },
      actualBreakdown: {
        income: goal.actualBreakdown?.income || 0,
        orderCount: goal.actualBreakdown?.orderCount || 0,
        retailVolume: goal.actualBreakdown?.retailVolume || 0,
      },
      actualExecution: {
        newLeads: goal.actualExecution?.newLeads || 0,
        visitCount: goal.actualExecution?.visitCount || 0,
        new5ALeads: goal.actualExecution?.new5ALeads || 0,
        visit5ACount: goal.actualExecution?.visit5ACount || 0,
        salonInviteCount: goal.actualExecution?.salonInviteCount || 0,
        引流CardCount: goal.actualExecution?.引流CardCount || 0,
      },
      createdAt: goal.createdAt,
      updatedAt: goal.updatedAt,
    } as any;
  };

  return (
    <div className="space-y-4">
      {goals.map((goal) => {
        const monthlyCount = monthlyGoalsCount(goal.id);
        const weeklyCount = weeklyGoalsCount(goal.id);
        const isExpanded = expandedId === goal.id;
        const breakdownProgress = calculateBreakdownProgress(goal);
        const executionProgress = calculateExecutionProgress(goal);

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

                    {/* 进度条 */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-600">拆解进度</span>
                          <span className="font-medium text-indigo-600">{breakdownProgress.toFixed(1)}%</span>
                        </div>
                        <Progress value={breakdownProgress} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-600">执行进度</span>
                          <span className="font-medium text-green-600">{executionProgress.toFixed(1)}%</span>
                        </div>
                        <Progress value={executionProgress} className="h-2" />
                      </div>
                    </div>

                    {/* 拆解类目标 */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-slate-600 mb-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-indigo-500" />
                        拆解类目标
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        <div className="bg-green-50 rounded-lg p-3">
                          <span className="text-xs text-green-700 font-medium">收入</span>
                          <p className="text-lg font-bold text-green-600">¥{(goal.breakdownGoals?.income || 0).toLocaleString()}</p>
                          {goal.actualBreakdown?.income !== undefined && goal.actualBreakdown.income > 0 && (
                            <p className={`text-xs mt-1 ${goal.actualBreakdown.income >= (goal.breakdownGoals?.income || 0) ? 'text-green-600 font-medium' : 'text-amber-600'}`}>
                              实际: ¥{goal.actualBreakdown.income.toLocaleString()}
                            </p>
                          )}
                        </div>
                        <div className="bg-amber-50 rounded-lg p-3">
                          <span className="text-xs text-amber-700 font-medium">级别</span>
                          <p className="text-sm font-semibold text-amber-600 truncate">{goal.breakdownGoals?.level || '-'}</p>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-3">
                          <span className="text-xs text-blue-700 font-medium">单量</span>
                          <p className="text-lg font-bold text-blue-600">{goal.breakdownGoals?.orderCount || 0}</p>
                          {goal.actualBreakdown?.orderCount !== undefined && goal.actualBreakdown.orderCount > 0 && (
                            <p className={`text-xs mt-1 ${goal.actualBreakdown.orderCount >= (goal.breakdownGoals?.orderCount || 0) ? 'text-green-600 font-medium' : 'text-amber-600'}`}>
                              实际: {goal.actualBreakdown.orderCount}
                            </p>
                          )}
                        </div>
                        <div className="bg-purple-50 rounded-lg p-3">
                          <span className="text-xs text-purple-700 font-medium">零售量</span>
                          <p className="text-lg font-bold text-purple-600">{goal.breakdownGoals?.retailVolume || 0}</p>
                          {goal.actualBreakdown?.retailVolume !== undefined && goal.actualBreakdown.retailVolume > 0 && (
                            <p className={`text-xs mt-1 ${goal.actualBreakdown.retailVolume >= (goal.breakdownGoals?.retailVolume || 0) ? 'text-green-600 font-medium' : 'text-amber-600'}`}>
                              实际: {goal.actualBreakdown.retailVolume}
                            </p>
                          )}
                        </div>
                        <div className="bg-cyan-50 rounded-lg p-3">
                          <span className="text-xs text-cyan-700 font-medium">旅游</span>
                          <p className="text-sm text-cyan-600 truncate">{goal.breakdownGoals?.travelGoal || '-'}</p>
                        </div>
                      </div>
                    </div>

                    {/* 执行类目标 */}
                    <div>
                      <h4 className="text-sm font-medium text-slate-600 mb-3 flex items-center gap-2">
                        <Users className="w-4 h-4 text-green-500" />
                        执行类目标
                      </h4>
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                        {[
                          { key: 'newLeads', label: '新增名单', color: 'blue' },
                          { key: 'visitCount', label: '拜访人次', color: 'purple' },
                          { key: 'new5ALeads', label: '新增5A', color: 'amber' },
                          { key: 'visit5ACount', label: '拜访5A', color: 'red' },
                          { key: 'salonInviteCount', label: '邀约沙龙', color: 'indigo' },
                          { key: '引流CardCount', label: '引流卡', color: 'cyan' },
                        ].map(({ key, label, color }) => {
                          const planValue = goal.executionGoals?.[key as keyof typeof goal.executionGoals] as number || 0;
                          const actualValue = goal.actualExecution?.[key as keyof typeof goal.actualExecution] as number | undefined;
                          const colorClasses: Record<string, { bg: string; text: string }> = {
                            blue: { bg: 'bg-blue-50', text: 'text-blue-600' },
                            purple: { bg: 'bg-purple-50', text: 'text-purple-600' },
                            amber: { bg: 'bg-amber-50', text: 'text-amber-600' },
                            red: { bg: 'bg-red-50', text: 'text-red-600' },
                            indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600' },
                            cyan: { bg: 'bg-cyan-50', text: 'text-cyan-600' },
                          };
                          const { bg, text } = colorClasses[color];
                          return (
                            <div key={key} className={`${bg} rounded-lg p-3 text-center`}>
                              <span className={`text-xs ${text.replace('600', '700')} font-medium`}>{label}</span>
                              <p className={`text-lg font-bold ${text}`}>{planValue}</p>
                              {actualValue !== undefined && actualValue > 0 && (
                                <p className={`text-xs mt-1 ${actualValue >= planValue ? 'text-green-600 font-medium' : 'text-amber-600'}`}>
                                  实际: {actualValue}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
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
                    
                    {onUpdateActual && (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenActual(goal);
                        }}
                        className="flex items-center gap-1 text-xs bg-indigo-600 hover:bg-indigo-700"
                      >
                        <Edit3 className="w-3 h-3" />
                        更新实际完成
                      </Button>
                    )}
                    
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
                      <p className="font-semibold text-green-600">¥{(goal.breakdownGoals?.income || 0).toLocaleString()}</p>
                      {goal.actualBreakdown?.income !== undefined && goal.actualBreakdown.income > 0 && (
                        <p className={`text-xs mt-1 ${goal.actualBreakdown.income >= (goal.breakdownGoals?.income || 0) ? 'text-green-600' : 'text-amber-600'}`}>
                          实际: ¥{goal.actualBreakdown.income.toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <p className="text-xs text-slate-500 mb-1">单量</p>
                      <p className="font-semibold text-blue-600">{goal.breakdownGoals?.orderCount || 0}</p>
                      {goal.actualBreakdown?.orderCount !== undefined && goal.actualBreakdown.orderCount > 0 && (
                        <p className={`text-xs mt-1 ${goal.actualBreakdown.orderCount >= (goal.breakdownGoals?.orderCount || 0) ? 'text-green-600' : 'text-amber-600'}`}>
                          实际: {goal.actualBreakdown.orderCount}
                        </p>
                      )}
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <p className="text-xs text-slate-500 mb-1">零售量</p>
                      <p className="font-semibold text-purple-600">{goal.breakdownGoals?.retailVolume || 0}</p>
                      {goal.actualBreakdown?.retailVolume !== undefined && goal.actualBreakdown.retailVolume > 0 && (
                        <p className={`text-xs mt-1 ${goal.actualBreakdown.retailVolume >= (goal.breakdownGoals?.retailVolume || 0) ? 'text-green-600' : 'text-amber-600'}`}>
                          实际: {goal.actualBreakdown.retailVolume}
                        </p>
                      )}
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <p className="text-xs text-slate-500 mb-1">级别</p>
                      <p className="font-semibold text-amber-600 truncate">{goal.breakdownGoals?.level || '-'}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      <ActualUpdateModal
        isOpen={isActualModalOpen}
        onClose={() => setIsActualModalOpen(false)}
        onSubmit={handleUpdateActual}
        goal={buildModalGoal(selectedGoal)}
        type="annual"
      />
    </div>
  );
};