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
  Users,
  ShoppingBag,
  Award,
  Plane,
  Layers
} from 'lucide-react';

interface AnnualGoalListProps {
  goals: AnnualGoal[];
  onEdit: (goal: AnnualGoal) => void;
  onDelete: (id: string) => void;
  onSelectGoal: (goal: AnnualGoal) => void;
  monthlyGoalsCount: (annualGoalId: string) => number;
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
  monthlyGoalsCount,
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
        const isExpanded = expandedId === goal.id;
        const breakdownProgress = calculateBreakdownProgress(goal);
        const executionProgress = calculateExecutionProgress(goal);
        const monthlyCount = monthlyGoalsCount(goal.id);

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
                {/* 标题和操作按钮 */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                      <Target className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">
                        {goal.year}年目标规划
                      </h3>
                      <p className="text-xs text-slate-500">
                        {monthlyCount} 个月度目标
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

                {/* 进度条 */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-slate-500">拆解进度</span>
                        <span className="text-xs font-medium text-indigo-600">{breakdownProgress.toFixed(1)}%</span>
                      </div>
                      <Progress value={breakdownProgress} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-slate-500">执行进度</span>
                        <span className="text-xs font-medium text-green-600">{executionProgress.toFixed(1)}%</span>
                      </div>
                      <Progress value={executionProgress} className="h-2" />
                    </div>
                  </div>

                  {/* 拆解类目标 */}
                  <div>
                    <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-indigo-500" />
                      拆解类目标
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {/* 收入 */}
                      <div className="bg-green-50 rounded-lg p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          <TrendingUp className="w-3.5 h-3.5 text-green-600" />
                          <span className="text-xs text-green-700 font-medium">收入</span>
                        </div>
                        <p className="text-sm font-semibold text-green-600">
                          计划: ¥{(goal.breakdownGoals?.income || 0).toLocaleString()}
                        </p>
                        {goal.actualBreakdown?.income !== undefined && (
                          <p className="text-xs text-green-500 mt-1">
                            实际: ¥{goal.actualBreakdown.income.toLocaleString()}
                          </p>
                        )}
                      </div>

                      {/* 级别 */}
                      <div className="bg-amber-50 rounded-lg p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Award className="w-3.5 h-3.5 text-amber-600" />
                          <span className="text-xs text-amber-700 font-medium">级别</span>
                        </div>
                        <p className="text-sm font-semibold text-amber-600 truncate">
                          {goal.breakdownGoals?.level || '未设置'}
                        </p>
                      </div>

                      {/* 单量 */}
                      <div className="bg-blue-50 rounded-lg p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />
                          <span className="text-xs text-blue-700 font-medium">单量</span>
                        </div>
                        <p className="text-sm font-semibold text-blue-600">
                          计划: {(goal.breakdownGoals?.orderCount || 0).toLocaleString()}
                        </p>
                        {goal.actualBreakdown?.orderCount !== undefined && (
                          <p className="text-xs text-blue-500 mt-1">
                            实际: {goal.actualBreakdown.orderCount}
                          </p>
                        )}
                      </div>

                      {/* 零售量 */}
                      <div className="bg-purple-50 rounded-lg p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          <ShoppingBag className="w-3.5 h-3.5 text-purple-600" />
                          <span className="text-xs text-purple-700 font-medium">零售量</span>
                        </div>
                        <p className="text-sm font-semibold text-purple-600">
                          计划: {(goal.breakdownGoals?.retailVolume || 0).toLocaleString()}
                        </p>
                        {goal.actualBreakdown?.retailVolume !== undefined && (
                          <p className="text-xs text-purple-500 mt-1">
                            实际: {goal.actualBreakdown.retailVolume}
                          </p>
                        )}
                      </div>

                      {/* 旅游 */}
                      {goal.breakdownGoals?.travelGoal && (
                        <div className="bg-cyan-50 rounded-lg p-3">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Plane className="w-3.5 h-3.5 text-cyan-600" />
                            <span className="text-xs text-cyan-700 font-medium">旅游</span>
                          </div>
                          <p className="text-sm text-cyan-600 truncate">
                            {goal.breakdownGoals.travelGoal}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 执行类目标 */}
                  <div>
                    <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-500" />
                      执行类目标
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                      {/* 新增名单 */}
                      <div className="bg-blue-50 rounded-lg p-3">
                        <span className="text-xs text-blue-700 font-medium">新增名单</span>
                        <p className="text-sm font-semibold text-blue-600 mt-1">
                          计划: {goal.executionGoals?.newLeads || 0}
                        </p>
                        {goal.actualExecution?.newLeads !== undefined && (
                          <p className="text-xs text-blue-500 mt-1">
                            实际: {goal.actualExecution.newLeads}
                          </p>
                        )}
                      </div>

                      {/* 拜访人次 */}
                      <div className="bg-purple-50 rounded-lg p-3">
                        <span className="text-xs text-purple-700 font-medium">拜访人次</span>
                        <p className="text-sm font-semibold text-purple-600 mt-1">
                          计划: {goal.executionGoals?.visitCount || 0}
                        </p>
                        {goal.actualExecution?.visitCount !== undefined && (
                          <p className="text-xs text-purple-500 mt-1">
                            实际: {goal.actualExecution.visitCount}
                          </p>
                        )}
                      </div>

                      {/* 新增5A */}
                      <div className="bg-orange-50 rounded-lg p-3">
                        <span className="text-xs text-orange-700 font-medium">新增5A</span>
                        <p className="text-sm font-semibold text-orange-600 mt-1">
                          计划: {goal.executionGoals?.new5ALeads || 0}
                        </p>
                        {goal.actualExecution?.new5ALeads !== undefined && (
                          <p className="text-xs text-orange-500 mt-1">
                            实际: {goal.actualExecution.new5ALeads}
                          </p>
                        )}
                      </div>

                      {/* 拜访5A */}
                      <div className="bg-pink-50 rounded-lg p-3">
                        <span className="text-xs text-pink-700 font-medium">拜访5A</span>
                        <p className="text-sm font-semibold text-pink-600 mt-1">
                          计划: {goal.executionGoals?.visit5ACount || 0}
                        </p>
                        {goal.actualExecution?.visit5ACount !== undefined && (
                          <p className="text-xs text-pink-500 mt-1">
                            实际: {goal.actualExecution.visit5ACount}
                          </p>
                        )}
                      </div>

                      {/* 邀约沙龙 */}
                      <div className="bg-indigo-50 rounded-lg p-3">
                        <span className="text-xs text-indigo-700 font-medium">邀约沙龙</span>
                        <p className="text-sm font-semibold text-indigo-600 mt-1">
                          计划: {goal.executionGoals?.salonInviteCount || 0}
                        </p>
                        {goal.actualExecution?.salonInviteCount !== undefined && (
                          <p className="text-xs text-indigo-500 mt-1">
                            实际: {goal.actualExecution.salonInviteCount}
                          </p>
                        )}
                      </div>

                      {/* 引流卡 */}
                      <div className="bg-teal-50 rounded-lg p-3">
                        <span className="text-xs text-teal-700 font-medium">引流卡</span>
                        <p className="text-sm font-semibold text-teal-600 mt-1">
                          计划: {goal.executionGoals?.引流CardCount || 0}
                        </p>
                        {goal.actualExecution?.引流CardCount !== undefined && goal.actualExecution.引流CardCount > 0 && (
                          <p className="text-xs text-teal-500 mt-1">
                            实际: {goal.actualExecution.引流CardCount}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 底部操作 */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="text-xs text-slate-500 flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5" />
                      <span className="font-medium">{monthlyCount}</span> 个月度目标
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
                    查看月度目标
                  </Button>

                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 ml-2" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 ml-2" />
                  )}
                </div>
              </div>

              {/* 展开详情 */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-2 bg-slate-50/50 border-t border-slate-100">
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                    <div className="bg-white rounded-lg p-3 shadow-sm text-center">
                      <p className="text-xs text-slate-500 mb-1">年度</p>
                      <p className="font-semibold text-slate-800">{goal.year}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm text-center">
                      <p className="text-xs text-slate-500 mb-1">拆解进度</p>
                      <p className="font-semibold text-indigo-600">{breakdownProgress.toFixed(0)}%</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm text-center">
                      <p className="text-xs text-slate-500 mb-1">执行进度</p>
                      <p className="font-semibold text-green-600">{executionProgress.toFixed(0)}%</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm text-center">
                      <p className="text-xs text-slate-500 mb-1">月度目标</p>
                      <p className="font-semibold text-slate-800">{monthlyCount}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm text-center">
                      <p className="text-xs text-slate-500 mb-1">创建时间</p>
                      <p className="font-semibold text-slate-600 text-xs">
                        {goal.createdAt ? new Date(goal.createdAt).toLocaleDateString() : '-'}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm text-center">
                      <p className="text-xs text-slate-500 mb-1">更新时间</p>
                      <p className="font-semibold text-slate-600 text-xs">
                        {goal.updatedAt ? new Date(goal.updatedAt).toLocaleDateString() : '-'}
                      </p>
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
