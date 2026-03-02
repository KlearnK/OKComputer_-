import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { AnnualGoal } from '@/types/goals';
import { Target, TrendingUp, ShoppingBag, Plane, Award } from 'lucide-react';

interface AnnualGoalFormProps {
  onSubmit: (goal: Omit<AnnualGoal, 'id' | 'createdAt' | 'updatedAt'>) => void;
  editingGoal?: AnnualGoal | null;
  onCancel?: () => void;
}

export const AnnualGoalForm = ({ onSubmit, editingGoal, onCancel }: AnnualGoalFormProps) => {
  const currentYear = new Date().getFullYear();
  const [formData, setFormData] = useState({
    year: currentYear,
    income: 0,
    level: '',
    orderCount: 0,
    retailVolume: 0,
    travelGoal: '',
  });

  useEffect(() => {
    if (editingGoal) {
      setFormData({
        year: editingGoal.year,
        income: editingGoal.income || 0,
        level: editingGoal.level || '',
        orderCount: editingGoal.orderCount || 0,
        retailVolume: editingGoal.retailVolume || 0,
        travelGoal: editingGoal.travelGoal || '',
      });
    } else {
      setFormData({
        year: currentYear,
        income: 0,
        level: '',
        orderCount: 0,
        retailVolume: 0,
        travelGoal: '',
      });
    }
  }, [editingGoal, currentYear]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    if (!editingGoal) {
      setFormData({
        year: currentYear,
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

  return (
    <Card className="w-full shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-800">
          <Target className="w-5 h-5 text-indigo-600" />
          {editingGoal ? '编辑年度目标' : '设置年度目标'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="year" className="text-sm font-medium text-slate-700">目标年份</Label>
              <Input
                id="year"
                type="number"
                value={formData.year}
                onChange={(e) => handleChange('year', parseInt(e.target.value))}
                min={2020}
                max={2030}
                className="border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="level" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                级别目标
              </Label>
              <Input
                id="level"
                type="text"
                placeholder="例如: 高级经理"
                value={formData.level}
                onChange={(e) => handleChange('level', e.target.value)}
                className="border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="income" className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              年收入目标 (¥)
            </Label>
            <Input
              id="income"
              type="number"
              placeholder="请输入年收入目标"
              value={formData.income}
              onChange={(e) => handleChange('income', parseInt(e.target.value) || 0)}
              min={0}
              step={10000}
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
                placeholder="请输入年度单量目标"
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
                placeholder="请输入年度零售量目标"
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
              placeholder="描述您的年度旅游目标，例如：去欧洲旅行2周"
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
        </form>
      </CardContent>
    </Card>
  );
};