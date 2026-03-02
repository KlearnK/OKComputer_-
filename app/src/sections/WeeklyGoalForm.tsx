import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { WeeklyGoal, MonthlyGoal } from '@/types/goals';
import { CalendarDays, TrendingUp, ShoppingBag, Plane, Award } from 'lucide-react';
import { getMonthWeeks, getMonthDisplayName } from '@/utils/dateUtils';

interface WeeklyGoalFormProps {
  monthlyGoals: MonthlyGoal[];
  onSubmit: (goal: Omit<WeeklyGoal, 'id' | 'createdAt' | 'updatedAt'>) => void;
  editingGoal?: WeeklyGoal | null;
  onCancel?: () => void;
  selectedMonthlyId?: string;
}

export const WeeklyGoalForm = ({
  monthlyGoals,
  onSubmit,
  editingGoal,
  onCancel,
  selectedMonthlyId,
}: WeeklyGoalFormProps) => {
  const [formData, setFormData] = useState({
    monthlyGoalId: selectedMonthlyId || '',
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    week: 1,
    weekISO: '',
    weekStartDate: '',
    weekEndDate: '',
    income: 0,
    level: '',
    orderCount: 0,
    retailVolume: 0,
    travelGoal: '',
  });

  const [availableWeeks, setAvailableWeeks] = useState<ReturnType<typeof getMonthWeeks>>([]);

  useEffect(() => {
    if (editingGoal) {
      setFormData({
        monthlyGoalId: editingGoal.monthlyGoalId,
        year: editingGoal.year,
        month: editingGoal.month,
        week: editingGoal.week,
        weekISO: editingGoal.weekISO,
        weekStartDate: editingGoal.weekStartDate,
        weekEndDate: editingGoal.weekEndDate,
        income: editingGoal.income,
        level: editingGoal.level,
        orderCount: editingGoal.orderCount,
        retailVolume: editingGoal.retailVolume,
        travelGoal: editingGoal.travelGoal,
      });
    } else if (selectedMonthlyId) {
      setFormData(prev => ({ ...prev, monthlyGoalId: selectedMonthlyId }));
    }
  }, [editingGoal, selectedMonthlyId]);

  // 当选择月度目标时，更新年月和周数选项
  useEffect(() => {
    if (formData.monthlyGoalId) {
      const monthlyGoal = monthlyGoals.find(g => g.id === formData.monthlyGoalId);
      if (monthlyGoal) {
        const weeks = getMonthWeeks(monthlyGoal.year, monthlyGoal.month);
        setAvailableWeeks(weeks);
        setFormData(prev => ({
          ...prev,
          year: monthlyGoal.year,
          month: monthlyGoal.month,
          week: weeks.length > 0 ? weeks[0].weekNum : 1,
        }));
      }
    }
  }, [formData.monthlyGoalId, monthlyGoals]);

  // 当周数变化时，更新ISO格式和起止日期
  useEffect(() => {
    const selectedWeek = availableWeeks.find(w => w.weekNum === formData.week);
    if (selectedWeek) {
      setFormData(prev => ({
        ...prev,
        weekISO: selectedWeek.weekISO,
        weekStartDate: selectedWeek.startDate,
        weekEndDate: selectedWeek.endDate,
      }));
    }
  }, [formData.week, availableWeeks]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.monthlyGoalId) {
      alert('请选择月度目标');
      return;
    }
    onSubmit(formData);
    if (!editingGoal) {
      setFormData({
        monthlyGoalId: selectedMonthlyId || '',
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        week: 1,
        weekISO: '',
        weekStartDate: '',
        weekEndDate: '',
        income: 0,
        level: '',
        orderCount: 0,
        retailVolume: 0,
        travelGoal: '',
      });
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const selectedMonthlyGoal = monthlyGoals.find(g => g.id === formData.monthlyGoalId);

  return (
    <Card className="w-full shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-800">
          <CalendarDays className="w-5 h-5 text-indigo-600" />
          {editingGoal ? '编辑周目标' : '设置周目标'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="monthlyGoalId" className="text-sm font-medium text-slate-700">所属月度目标</Label>
            <Select
              value={formData.monthlyGoalId}
              onValueChange={(value) => handleChange('monthlyGoalId', value)}
            >
              <SelectTrigger className="border-slate-200 focus:border-indigo-500 focus:ring-indigo-500">
                <SelectValue placeholder="选择月度目标" />
              </SelectTrigger>
              <SelectContent>
                {monthlyGoals.map(goal => (
                  <SelectItem key={goal.id} value={goal.id}>
                    {getMonthDisplayName(goal.monthISO)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedMonthlyGoal && availableWeeks.length > 0 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="week" className="text-sm font-medium text-slate-700">周次 (ISO8601)</Label>
                <Select
                  value={formData.week.toString()}
                  onValueChange={(value) => handleChange('week', parseInt(value))}
                >
                  <SelectTrigger className="border-slate-200 focus:border-indigo-500 focus:ring-indigo-500">
                    <SelectValue placeholder="选择周次" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableWeeks.map(week => (
                      <SelectItem key={week.weekISO} value={week.weekNum.toString()}>
                        第{week.weekNum}周 ({week.startDateDisplay} - {week.endDateDisplay})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">
                  ISO8601格式: {formData.weekISO}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="level" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-500" />
                    级别目标
                  </Label>
                  <Input
                    id="level"
                    type="text"
                    placeholder="例如: 达成周冠军"
                    value={formData.level}
                    onChange={(e) => handleChange('level', e.target.value)}
                    className="border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="income" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    周收入目标 (¥)
                  </Label>
                  <Input
                    id="income"
                    type="number"
                    placeholder="请输入周收入目标"
                    value={formData.income}
                    onChange={(e) => handleChange('income', parseInt(e.target.value) || 0)}
                    min={0}
                    step={500}
                    className="border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="orderCount" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-blue-500" />
                    单量目标
                  </Label>
                  <Input
                    id="orderCount"
                    type="number"
                    placeholder="请输入周单量目标"
                    value={formData.orderCount}
                    onChange={(e) => handleChange('orderCount', parseInt(e.target.value) || 0)}
                    min={0}
                    className="border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="retailVolume" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-purple-500" />
                    零售量目标
                  </Label>
                  <Input
                    id="retailVolume"
                    type="number"
                    placeholder="请输入周零售量目标"
                    value={formData.retailVolume}
                    onChange={(e) => handleChange('retailVolume', parseInt(e.target.value) || 0)}
                    min={0}
                    className="border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="travelGoal" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Plane className="w-4 h-4 text-cyan-500" />
                  旅游目标
                </Label>
                <Textarea
                  id="travelGoal"
                  placeholder="描述您的周度旅游计划"
                  value={formData.travelGoal}
                  onChange={(e) => handleChange('travelGoal', e.target.value)}
                  rows={3}
                  className="border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  {editingGoal ? '更新目标' : '创建目标'}
                </Button>
                {onCancel && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    className="px-6 border-slate-200 hover:bg-slate-50"
                  >
                    取消
                  </Button>
                )}
              </div>
            </>
          )}

          {selectedMonthlyGoal && availableWeeks.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <CalendarDays className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="text-sm">该月暂无可用周次</p>
              <p className="text-xs text-slate-400 mt-1">请检查月份设置</p>
            </div>
          )}

          {!selectedMonthlyGoal && (
            <div className="text-center py-8 text-slate-500">
              <CalendarDays className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="text-sm">请先选择月度目标</p>
              <p className="text-xs text-slate-400 mt-1">周目标需要关联到月度目标</p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};
