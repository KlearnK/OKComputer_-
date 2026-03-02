import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { MonthlyGoal } from '@/types/goals';
import type { AnnualGoal } from '@/types/goals';
import { Calendar, TrendingUp, ShoppingBag, Plane, Award } from 'lucide-react';
import { getYearMonths } from '@/utils/dateUtils';

interface MonthlyGoalFormProps {
  annualGoals: AnnualGoal[];
  onSubmit: (goal: Omit<MonthlyGoal, 'id' | 'createdAt' | 'updatedAt'>) => void;
  editingGoal?: MonthlyGoal | null;
  onCancel?: () => void;
  selectedAnnualId?: string;
}

export const MonthlyGoalForm = ({
  annualGoals,
  onSubmit,
  editingGoal,
  onCancel,
  selectedAnnualId,
}: MonthlyGoalFormProps) => {
  const currentYear = new Date().getFullYear();
  const [formData, setFormData] = useState({
    annualGoalId: selectedAnnualId || '',
    year: currentYear,
    month: new Date().getMonth() + 1,
    monthISO: '',
    income: 0,
    level: '',
    orderCount: 0,
    retailVolume: 0,
    travelGoal: '',
  });

  useEffect(() => {
    if (editingGoal) {
      setFormData({
        annualGoalId: editingGoal.annualGoalId,
        year: editingGoal.year,
        month: editingGoal.month,
        monthISO: editingGoal.monthISO,
        income: editingGoal.income || 0,
        level: editingGoal.level || '',
        orderCount: editingGoal.orderCount || 0,
        retailVolume: editingGoal.retailVolume || 0,
        travelGoal: editingGoal.travelGoal || '',
      });
    } else if (selectedAnnualId) {
      setFormData(prev => ({ ...prev, annualGoalId: selectedAnnualId }));
    }
  }, [editingGoal, selectedAnnualId]);

  // 当选择年度目标时，自动设置年份
  useEffect(() => {
    if (formData.annualGoalId) {
      const annualGoal = annualGoals.find(g => g.id === formData.annualGoalId);
      if (annualGoal) {
        setFormData(prev => ({ ...prev, year: annualGoal.year }));
      }
    }
  }, [formData.annualGoalId, annualGoals]);

  // 当月份或年份变化时，更新ISO格式
  useEffect(() => {
    const monthISO = `${formData.year}-${formData.month.toString().padStart(2, '0')}`;
    setFormData(prev => ({ ...prev, monthISO }));
  }, [formData.year, formData.month]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.annualGoalId) {
      alert('请选择年度目标');
      return;
    }
    onSubmit(formData);
    if (!editingGoal) {
      setFormData({
        annualGoalId: selectedAnnualId || '',
        year: currentYear,
        month: new Date().getMonth() + 1,
        monthISO: '',
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

  const selectedAnnualGoal = annualGoals.find(g => g.id === formData.annualGoalId);
  const availableMonths = selectedAnnualGoal ? getYearMonths(selectedAnnualGoal.year) : [];

  return (
    <Card className="w-full shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-800">
          <Calendar className="w-5 h-5 text-indigo-600" />
          {editingGoal ? '编辑月度目标' : '设置月度目标'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="annualGoalId" className="text-sm font-medium text-slate-700">所属年度目标</Label>
            <Select
              value={formData.annualGoalId}
              onValueChange={(value) => handleChange('annualGoalId', value)}
            >
              <SelectTrigger className="border-slate-200 focus:border-indigo-500 focus:ring-indigo-500">
                <SelectValue placeholder="选择年度目标" />
              </SelectTrigger>
              <SelectContent>
                {annualGoals.map(goal => (
                  <SelectItem key={goal.id} value={goal.id}>
                    {goal.year}年目标
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedAnnualGoal && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="month" className="text-sm font-medium text-slate-700">月份</Label>
                <Select
                  value={formData.month.toString()}
                  onValueChange={(value) => handleChange('month', parseInt(value))}
                >
                  <SelectTrigger className="border-slate-200 focus:border-indigo-500 focus:ring-indigo-500">
                    <SelectValue placeholder="选择月份" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableMonths.map(month => (
                      <SelectItem key={month.monthISO} value={month.monthNum.toString()}>
                        {month.monthName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="level" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  级别目标
                </Label>
                <Input
                  id="level"
                  type="text"
                  placeholder="例如: 达成月度冠军"
                  value={formData.level}
                  onChange={(e) => handleChange('level', e.target.value)}
                  className="border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          {selectedAnnualGoal && (
            <>
              <div className="space-y-2">
                <Label htmlFor="income" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  月收入目标 (¥)
                </Label>
                <Input
                  id="income"
                  type="number"
                  placeholder="请输入月度收入目标"
                  value={formData.income}
                  onChange={(e) => handleChange('income', parseInt(e.target.value) || 0)}
                  min={0}
                  step={1000}
                  className="border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                />
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
                    placeholder="请输入月度单量目标"
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
                    placeholder="请输入月度零售量目标"
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
                  placeholder="描述您的月度旅游计划"
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

          {!selectedAnnualGoal && (
            <div className="text-center py-8 text-slate-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="text-sm">请先选择年度目标</p>
              <p className="text-xs text-slate-400 mt-1">月度目标需要关联到年度目标</p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};