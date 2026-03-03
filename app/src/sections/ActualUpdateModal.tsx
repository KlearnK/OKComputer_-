import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import type { TeamMemberMonthlyGoal, TeamMemberWeeklyGoal, TeamMemberAnnualGoal } from '@/types/team';
import { Target, Users, TrendingUp } from 'lucide-react';

interface ActualUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (actualBreakdown: any, actualExecution: any) => void;
  goal: TeamMemberMonthlyGoal | TeamMemberWeeklyGoal | TeamMemberAnnualGoal | null;
  type: 'annual' | 'monthly' | 'weekly';
}

export const ActualUpdateModal = ({
  isOpen,
  onClose,
  onSubmit,
  goal,
  type,
}: ActualUpdateModalProps) => {
  // 防止对话框关闭时渲染
  if (!isOpen) return null;
  
  const [actualBreakdown, setActualBreakdown] = useState({
    income: '',
    orderCount: '',
    retailVolume: '',
  });
  const [actualExecution, setActualExecution] = useState({
    newLeads: '',
    visitCount: '',
    new5ALeads: '',
    visit5ACount: '',
    salonInviteCount: '',
    引流CardCount: '',
  });

  // 当goal变化时，加载现有的实际完成数据
  useEffect(() => {
    if (goal) {
      setActualBreakdown({
        income: goal.actualBreakdown?.income?.toString() || '',
        orderCount: goal.actualBreakdown?.orderCount?.toString() || '',
        retailVolume: goal.actualBreakdown?.retailVolume?.toString() || '',
      });
      setActualExecution({
        newLeads: goal.actualExecution?.newLeads?.toString() || '',
        visitCount: goal.actualExecution?.visitCount?.toString() || '',
        new5ALeads: goal.actualExecution?.new5ALeads?.toString() || '',
        visit5ACount: goal.actualExecution?.visit5ACount?.toString() || '',
        salonInviteCount: goal.actualExecution?.salonInviteCount?.toString() || '',
        引流CardCount: goal.actualExecution?.引流CardCount?.toString() || '',
      });
    }
  }, [goal]);

  // 添加空值保护 - 如果 goal 为空，显示错误提示而不是白屏
  if (!goal) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>错误</DialogTitle>
          </DialogHeader>
          <p className="text-slate-600">无法加载目标数据，请关闭后重试。</p>
          <DialogFooter>
            <Button onClick={onClose}>关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  const handleSubmit = () => {
    const breakdownData = {
      income: parseInt(actualBreakdown.income) || 0,
      orderCount: parseInt(actualBreakdown.orderCount) || 0,
      retailVolume: parseInt(actualBreakdown.retailVolume) || 0,
    };
    const executionData = {
      newLeads: parseInt(actualExecution.newLeads) || 0,
      visitCount: parseInt(actualExecution.visitCount) || 0,
      new5ALeads: parseInt(actualExecution.new5ALeads) || 0,
      visit5ACount: parseInt(actualExecution.visit5ACount) || 0,
      salonInviteCount: parseInt(actualExecution.salonInviteCount) || 0,
      引流CardCount: parseInt(actualExecution.引流CardCount) || 0,
    };
    onSubmit(breakdownData, executionData);
    onClose();
  };

  const typeLabel = type === 'annual' ? '年度' : type === 'monthly' ? '月度' : '周别';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto p-0">
        {/* 标题区域 */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100 sticky top-0 bg-white z-10">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-slate-800">更新{typeLabel}实际完成数据</span>
              <p className="text-sm font-normal text-slate-500 mt-0.5">
                请填写各项实际完成数值，系统将自动计算完成进度
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-5 space-y-6">
          {/* 拆解类目标 */}
          <div className="bg-gradient-to-br from-indigo-50/80 to-blue-50/50 rounded-xl border border-indigo-100 overflow-hidden">
            {/* 标题栏 */}
            <div className="bg-indigo-100/50 px-4 py-3 border-b border-indigo-100">
              <h3 className="font-semibold text-indigo-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                拆解类目标
              </h3>
            </div>
            
            {/* 内容区域 */}
            <div className="p-4">
              <div className="grid grid-cols-3 gap-4">
                {/* 收入 */}
                <div className="bg-white rounded-lg p-3 border border-indigo-100 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm font-medium text-slate-700">收入</Label>
                    <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                      计划: ¥{(goal.breakdownGoals?.income ?? 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">¥</span>
                    <Input
                      type="number"
                      placeholder="实际收入"
                      value={actualBreakdown.income}
                      onChange={(e) => setActualBreakdown(prev => ({ ...prev, income: e.target.value }))}
                      className="pl-6 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* 单量 */}
                <div className="bg-white rounded-lg p-3 border border-indigo-100 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm font-medium text-slate-700">单量</Label>
                    <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                      计划: {goal.breakdownGoals?.orderCount ?? 0}
                    </span>
                  </div>
                  <Input
                    type="number"
                    placeholder="实际单量"
                    value={actualBreakdown.orderCount}
                    onChange={(e) => setActualBreakdown(prev => ({ ...prev, orderCount: e.target.value }))}
                    className="border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                {/* 零售量 */}
                <div className="bg-white rounded-lg p-3 border border-indigo-100 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm font-medium text-slate-700">零售量</Label>
                    <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                      计划: {goal.breakdownGoals?.retailVolume ?? 0}
                    </span>
                  </div>
                  <Input
                    type="number"
                    placeholder="实际零售量"
                    value={actualBreakdown.retailVolume}
                    onChange={(e) => setActualBreakdown(prev => ({ ...prev, retailVolume: e.target.value }))}
                    className="border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 执行类目标 */}
          <div className="bg-gradient-to-br from-emerald-50/80 to-green-50/50 rounded-xl border border-emerald-100 overflow-hidden">
            {/* 标题栏 */}
            <div className="bg-emerald-100/50 px-4 py-3 border-b border-emerald-100">
              <h3 className="font-semibold text-emerald-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                执行类目标
              </h3>
            </div>
            
            {/* 内容区域 */}
            <div className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {/* 新增名单 */}
                <div className="bg-white rounded-lg p-3 border border-emerald-100 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm font-medium text-slate-700">新增名单</Label>
                    <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      计划: {goal.executionGoals?.newLeads ?? 0}
                    </span>
                  </div>
                  <Input
                    type="number"
                    placeholder="实际"
                    value={actualExecution.newLeads}
                    onChange={(e) => setActualExecution(prev => ({ ...prev, newLeads: e.target.value }))}
                    className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </div>

                {/* 拜访人次 */}
                <div className="bg-white rounded-lg p-3 border border-emerald-100 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm font-medium text-slate-700">拜访人次</Label>
                    <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      计划: {goal.executionGoals?.visitCount ?? 0}
                    </span>
                  </div>
                  <Input
                    type="number"
                    placeholder="实际"
                    value={actualExecution.visitCount}
                    onChange={(e) => setActualExecution(prev => ({ ...prev, visitCount: e.target.value }))}
                    className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </div>

                {/* 新增5A */}
                <div className="bg-white rounded-lg p-3 border border-emerald-100 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm font-medium text-slate-700">新增5A</Label>
                    <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      计划: {goal.executionGoals?.new5ALeads ?? 0}
                    </span>
                  </div>
                  <Input
                    type="number"
                    placeholder="实际"
                    value={actualExecution.new5ALeads}
                    onChange={(e) => setActualExecution(prev => ({ ...prev, new5ALeads: e.target.value }))}
                    className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </div>

                {/* 拜访5A */}
                <div className="bg-white rounded-lg p-3 border border-emerald-100 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm font-medium text-slate-700">拜访5A</Label>
                    <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      计划: {goal.executionGoals?.visit5ACount ?? 0}
                    </span>
                  </div>
                  <Input
                    type="number"
                    placeholder="实际"
                    value={actualExecution.visit5ACount}
                    onChange={(e) => setActualExecution(prev => ({ ...prev, visit5ACount: e.target.value }))}
                    className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </div>

                {/* 邀约沙龙 */}
                <div className="bg-white rounded-lg p-3 border border-emerald-100 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm font-medium text-slate-700">邀约沙龙</Label>
                    <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      计划: {goal.executionGoals?.salonInviteCount ?? 0}
                    </span>
                  </div>
                  <Input
                    type="number"
                    placeholder="实际"
                    value={actualExecution.salonInviteCount}
                    onChange={(e) => setActualExecution(prev => ({ ...prev, salonInviteCount: e.target.value }))}
                    className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </div>

                {/* 引流卡 */}
                <div className="bg-white rounded-lg p-3 border border-emerald-100 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm font-medium text-slate-700">引流卡</Label>
                    <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      计划: {goal.executionGoals?.引流CardCount ?? 0}
                    </span>
                  </div>
                  <Input
                    type="number"
                    placeholder="实际"
                    value={actualExecution.引流CardCount}
                    onChange={(e) => setActualExecution(prev => ({ ...prev, 引流CardCount: e.target.value }))}
                    className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <DialogFooter className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 sticky bottom-0">
          <Button variant="outline" onClick={onClose} className="min-w-[100px]">
            取消
          </Button>
          <Button onClick={handleSubmit} className="bg-indigo-600 hover:bg-indigo-700 min-w-[100px]">
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};