import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { TeamMemberMonthlyGoal, TeamMemberWeeklyGoal, TeamMemberAnnualGoal } from '@/types/team';
import { Target, TrendingUp, Users, Calendar } from 'lucide-react';

// 生成年份选项
const generateYearOptions = () => {
  const currentYear = new Date().getFullYear();
  return [currentYear - 1, currentYear, currentYear + 1];
};

// 生成月份选项
const generateMonthOptions = () => {
  return Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: `${i + 1}月`,
    iso: `${new Date().getFullYear()}-${String(i + 1).padStart(2, '0')}`,
  }));
};

// 生成周选项（按实际日期范围）
const generateWeekOptions = (year: number) => {
  const weeks: { value: number; label: string; iso: string; startDate: string; endDate: string }[] = [];
  
  // 找到该年的第一个周一或1月1日
  let currentDate = new Date(year, 0, 1);
  const dayOfWeek = currentDate.getDay();
  // 调整到周日开始（0=周日）
  if (dayOfWeek !== 0) {
    currentDate.setDate(currentDate.getDate() - dayOfWeek);
  }
  
  let weekNum = 1;
  while (currentDate.getFullYear() <= year || (currentDate.getFullYear() === year + 1 && currentDate.getMonth() === 0 && currentDate.getDate() <= 7)) {
    const weekStart = new Date(currentDate);
    const weekEnd = new Date(currentDate);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    // 格式化日期显示
    const formatDate = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;
    const label = `第${weekNum}周（${formatDate(weekStart)}-${formatDate(weekEnd)}）`;
    
    weeks.push({
      value: weekNum,
      label,
      iso: `${year}-W${String(weekNum).padStart(2, '0')}`,
      startDate: weekStart.toISOString().split('T')[0],
      endDate: weekEnd.toISOString().split('T')[0],
    });
    
    currentDate.setDate(currentDate.getDate() + 7);
    weekNum++;
    
    // 限制最多54周
    if (weekNum > 54) break;
  }
  
  return weeks;
};

interface GoalSettingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    breakdownGoals: any;
    executionGoals: any;
    year?: number;
    month?: number;
    monthISO?: string;
    week?: number;
    weekISO?: string;
    weekStartDate?: string;
    weekEndDate?: string;
  }) => void;
  goal: TeamMemberMonthlyGoal | TeamMemberWeeklyGoal | TeamMemberAnnualGoal | null;
  title: string;
  mode: 'create' | 'edit';
  type: 'monthly' | 'weekly' | 'annual';
  existingMonths?: number[];
  existingWeeks?: number[];
}

export const GoalSettingModal = ({
  isOpen,
  onClose,
  onSubmit,
  goal,
  title,
  mode,
  type,
  existingMonths = [],
  existingWeeks = [],
}: GoalSettingModalProps) => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [week, setWeek] = useState(1);
  const [breakdownGoals, setBreakdownGoals] = useState({
    income: '',
    orderCount: '',
    retailVolume: '',
    level: '',
    travelGoal: '',
  });
  const [executionGoals, setExecutionGoals] = useState({
    newLeads: '',
    visitCount: '',
    new5ALeads: '',
    visit5ACount: '',
    salonInviteCount: '',
    引流CardCount: '',
  });

  const yearOptions = generateYearOptions();
  const monthOptions = generateMonthOptions();
  const weekOptions = generateWeekOptions(year);

  useEffect(() => {
    if (goal) {
      // 编辑模式：加载现有数据
      if (type === 'monthly') {
        const monthlyGoal = goal as TeamMemberMonthlyGoal;
        setYear(monthlyGoal.year);
        setMonth(monthlyGoal.month);
      } else {
        const weeklyGoal = goal as TeamMemberWeeklyGoal;
        setYear(weeklyGoal.year);
        setWeek(weeklyGoal.week);
      }
      setBreakdownGoals({
        income: goal.breakdownGoals?.income?.toString() || '',
        orderCount: goal.breakdownGoals?.orderCount?.toString() || '',
        retailVolume: goal.breakdownGoals?.retailVolume?.toString() || '',
        level: goal.breakdownGoals?.level || '',
        travelGoal: goal.breakdownGoals?.travelGoal || '',
      });
      setExecutionGoals({
        newLeads: goal.executionGoals?.newLeads?.toString() || '',
        visitCount: goal.executionGoals?.visitCount?.toString() || '',
        new5ALeads: goal.executionGoals?.new5ALeads?.toString() || '',
        visit5ACount: goal.executionGoals?.visit5ACount?.toString() || '',
        salonInviteCount: goal.executionGoals?.salonInviteCount?.toString() || '',
        引流CardCount: goal.executionGoals?.引流CardCount?.toString() || '',
      });
    } else {
      // 创建模式：清空表单，设置默认值
      const now = new Date();
      setYear(now.getFullYear());
      setMonth(now.getMonth() + 1);
      setWeek(1);
      setBreakdownGoals({
        income: '',
        orderCount: '',
        retailVolume: '',
        level: '',
        travelGoal: '',
      });
      setExecutionGoals({
        newLeads: '',
        visitCount: '',
        new5ALeads: '',
        visit5ACount: '',
        salonInviteCount: '',
        引流CardCount: '',
      });
    }
  }, [goal, isOpen, type]);

  const handleSubmit = () => {
    const breakdownData = {
      income: parseInt(breakdownGoals.income) || 0,
      orderCount: parseInt(breakdownGoals.orderCount) || 0,
      retailVolume: parseInt(breakdownGoals.retailVolume) || 0,
      level: breakdownGoals.level,
      travelGoal: breakdownGoals.travelGoal,
    };
    const executionData = {
      newLeads: parseInt(executionGoals.newLeads) || 0,
      visitCount: parseInt(executionGoals.visitCount) || 0,
      new5ALeads: parseInt(executionGoals.new5ALeads) || 0,
      visit5ACount: parseInt(executionGoals.visit5ACount) || 0,
      salonInviteCount: parseInt(executionGoals.salonInviteCount) || 0,
      引流CardCount: parseInt(executionGoals.引流CardCount) || 0,
    };

    const submitData: any = {
      breakdownGoals: breakdownData,
      executionGoals: executionData,
      year,
    };

    if (type === 'monthly') {
      const selectedMonth = monthOptions.find(m => m.value === month);
      submitData.month = month;
      submitData.monthISO = selectedMonth?.iso || `${year}-${String(month).padStart(2, '0')}`;
    } else {
      const selectedWeek = weekOptions.find(w => w.value === week);
      submitData.week = week;
      submitData.weekISO = selectedWeek?.iso || `${year}-W${String(week).padStart(2, '0')}`;
      submitData.weekStartDate = selectedWeek?.startDate;
      submitData.weekEndDate = selectedWeek?.endDate;
    }

    onSubmit(submitData);
    onClose();
  };

  // 检查月份是否已存在
  const isMonthExists = (m: number) => existingMonths.includes(m);
  
  // 检查周是否已存在
  const isWeekExists = (w: number) => existingWeeks.includes(w);

  // 获取可用的月份选项
  const availableMonths = mode === 'create' 
    ? monthOptions.filter(m => !isMonthExists(m.value))
    : monthOptions;

  // 获取可用的周选项
  const availableWeeks = mode === 'create'
    ? weekOptions.filter(w => !isWeekExists(w.value))
    : weekOptions;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100 sticky top-0 bg-white z-10">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-slate-800">{title}</span>
              <p className="text-sm font-normal text-slate-500 mt-0.5">
                {mode === 'create' ? '创建新的目标' : '编辑现有目标'}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-5 space-y-6">
          {/* 日期选择区域 */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
            <h3 className="text-sm font-medium text-slate-700 mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-500" />
              {type === 'monthly' ? '选择月份' : '选择周别'}
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              {/* 年份选择 */}
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-2 block">年份</Label>
                <Select 
                  value={year.toString()} 
                  onValueChange={(v) => setYear(parseInt(v))}
                  disabled={mode === 'edit'}
                >
                  <SelectTrigger className="border-slate-200">
                    <SelectValue placeholder="选择年份" />
                  </SelectTrigger>
                  <SelectContent>
                    {yearOptions.map(y => (
                      <SelectItem key={y} value={y.toString()}>{y}年</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 月份或周选择 */}
              {type === 'monthly' ? (
                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-2 block">月份</Label>
                  <Select 
                    value={month.toString()} 
                    onValueChange={(v) => setMonth(parseInt(v))}
                    disabled={mode === 'edit'}
                  >
                    <SelectTrigger className="border-slate-200">
                      <SelectValue placeholder="选择月份" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableMonths.length > 0 ? (
                        availableMonths.map(m => (
                          <SelectItem key={m.value} value={m.value.toString()}>{m.label}</SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>所有月份已创建</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {mode === 'create' && availableMonths.length === 0 && (
                    <p className="text-xs text-amber-600 mt-1">该年份的所有月份目标已创建</p>
                  )}
                </div>
              ) : (
                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-2 block">周别</Label>
                  <Select 
                    value={week.toString()} 
                    onValueChange={(v) => setWeek(parseInt(v))}
                    disabled={mode === 'edit'}
                  >
                    <SelectTrigger className="border-slate-200">
                      <SelectValue placeholder="选择周别" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {availableWeeks.length > 0 ? (
                        availableWeeks.map(w => (
                          <SelectItem key={w.value} value={w.value.toString()}>{w.label}</SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>所有周别已创建</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {mode === 'create' && availableWeeks.length === 0 && (
                    <p className="text-xs text-amber-600 mt-1">该年份的所有周别目标已创建</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <Tabs defaultValue="breakdown" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="breakdown" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                拆解类目标
              </TabsTrigger>
              <TabsTrigger value="execution" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                执行类目标
              </TabsTrigger>
            </TabsList>

            <TabsContent value="breakdown" className="space-y-4">
              <div className="bg-gradient-to-br from-indigo-50/80 to-blue-50/50 rounded-xl border border-indigo-100 p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-3 border border-indigo-100 shadow-sm">
                    <Label className="text-sm font-medium text-slate-700 mb-2 block">收入目标 (¥)</Label>
                    <Input
                      type="number"
                      placeholder="输入收入目标"
                      value={breakdownGoals.income}
                      onChange={(e) => setBreakdownGoals(prev => ({ ...prev, income: e.target.value }))}
                      className="border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="bg-white rounded-lg p-3 border border-indigo-100 shadow-sm">
                    <Label className="text-sm font-medium text-slate-700 mb-2 block">单量目标</Label>
                    <Input
                      type="number"
                      placeholder="输入单量目标"
                      value={breakdownGoals.orderCount}
                      onChange={(e) => setBreakdownGoals(prev => ({ ...prev, orderCount: e.target.value }))}
                      className="border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="bg-white rounded-lg p-3 border border-indigo-100 shadow-sm">
                    <Label className="text-sm font-medium text-slate-700 mb-2 block">零售量目标</Label>
                    <Input
                      type="number"
                      placeholder="输入零售量目标"
                      value={breakdownGoals.retailVolume}
                      onChange={(e) => setBreakdownGoals(prev => ({ ...prev, retailVolume: e.target.value }))}
                      className="border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="bg-white rounded-lg p-3 border border-indigo-100 shadow-sm">
                    <Label className="text-sm font-medium text-slate-700 mb-2 block">级别目标</Label>
                    <Input
                      type="text"
                      placeholder="输入级别目标"
                      value={breakdownGoals.level}
                      onChange={(e) => setBreakdownGoals(prev => ({ ...prev, level: e.target.value }))}
                      className="border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="bg-white rounded-lg p-3 border border-indigo-100 shadow-sm md:col-span-2">
                    <Label className="text-sm font-medium text-slate-700 mb-2 block">旅游目标</Label>
                    <Input
                      type="text"
                      placeholder="输入旅游目标"
                      value={breakdownGoals.travelGoal}
                      onChange={(e) => setBreakdownGoals(prev => ({ ...prev, travelGoal: e.target.value }))}
                      className="border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="execution" className="space-y-4">
              <div className="bg-gradient-to-br from-emerald-50/80 to-green-50/50 rounded-xl border border-emerald-100 p-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-3 border border-emerald-100 shadow-sm">
                    <Label className="text-sm font-medium text-slate-700 mb-2 block">新增名单</Label>
                    <Input
                      type="number"
                      placeholder="目标数"
                      value={executionGoals.newLeads}
                      onChange={(e) => setExecutionGoals(prev => ({ ...prev, newLeads: e.target.value }))}
                      className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="bg-white rounded-lg p-3 border border-emerald-100 shadow-sm">
                    <Label className="text-sm font-medium text-slate-700 mb-2 block">拜访人次</Label>
                    <Input
                      type="number"
                      placeholder="目标数"
                      value={executionGoals.visitCount}
                      onChange={(e) => setExecutionGoals(prev => ({ ...prev, visitCount: e.target.value }))}
                      className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="bg-white rounded-lg p-3 border border-emerald-100 shadow-sm">
                    <Label className="text-sm font-medium text-slate-700 mb-2 block">新增5A</Label>
                    <Input
                      type="number"
                      placeholder="目标数"
                      value={executionGoals.new5ALeads}
                      onChange={(e) => setExecutionGoals(prev => ({ ...prev, new5ALeads: e.target.value }))}
                      className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="bg-white rounded-lg p-3 border border-emerald-100 shadow-sm">
                    <Label className="text-sm font-medium text-slate-700 mb-2 block">拜访5A</Label>
                    <Input
                      type="number"
                      placeholder="目标数"
                      value={executionGoals.visit5ACount}
                      onChange={(e) => setExecutionGoals(prev => ({ ...prev, visit5ACount: e.target.value }))}
                      className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="bg-white rounded-lg p-3 border border-emerald-100 shadow-sm">
                    <Label className="text-sm font-medium text-slate-700 mb-2 block">邀约沙龙</Label>
                    <Input
                      type="number"
                      placeholder="目标数"
                      value={executionGoals.salonInviteCount}
                      onChange={(e) => setExecutionGoals(prev => ({ ...prev, salonInviteCount: e.target.value }))}
                      className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="bg-white rounded-lg p-3 border border-emerald-100 shadow-sm">
                    <Label className="text-sm font-medium text-slate-700 mb-2 block">引流卡</Label>
                    <Input
                      type="number"
                      placeholder="目标数"
                      value={executionGoals.引流CardCount}
                      onChange={(e) => setExecutionGoals(prev => ({ ...prev, 引流CardCount: e.target.value }))}
                      className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 sticky bottom-0">
          <Button variant="outline" onClick={onClose} className="min-w-[100px]">
            取消
          </Button>
          <Button 
            onClick={handleSubmit} 
            className="bg-indigo-600 hover:bg-indigo-700 min-w-[100px]"
            disabled={mode === 'create' && (
              (type === 'monthly' && availableMonths.length === 0) ||
              (type === 'weekly' && availableWeeks.length === 0)
            )}
          >
            {mode === 'create' ? '创建' : '更新'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
