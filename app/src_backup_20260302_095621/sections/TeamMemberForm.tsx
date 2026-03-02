import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { TeamMember } from '@/types/team';
import { UserPlus, Phone, User, Calendar, MessageCircle } from 'lucide-react';

interface TeamMemberFormProps {
  onSubmit: (member: Omit<TeamMember, 'id' | 'createdAt' | 'updatedAt'>) => void;
  editingMember?: TeamMember | null;
  onCancel?: () => void;
}

export const TeamMemberForm = ({ onSubmit, editingMember, onCancel }: TeamMemberFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    wechat: '',
    joinDate: new Date().toISOString().split('T')[0],
    status: 'active' as 'active' | 'inactive',
  });

  useEffect(() => {
    if (editingMember) {
      setFormData({
        name: editingMember.name,
        phone: editingMember.phone,
        wechat: editingMember.wechat || '',
        joinDate: editingMember.joinDate,
        status: editingMember.status,
      });
    } else {
      setFormData({
        name: '',
        phone: '',
        wechat: '',
        joinDate: new Date().toISOString().split('T')[0],
        status: 'active',
      });
    }
  }, [editingMember]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    if (!editingMember) {
      setFormData({
        name: '',
        phone: '',
        wechat: '',
        joinDate: new Date().toISOString().split('T')[0],
        status: 'active',
      });
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-800">
          <UserPlus className="w-5 h-5 text-indigo-600" />
          {editingMember ? '编辑团队成员' : '添加团队成员'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <User className="w-4 h-4 text-slate-500" />
              姓名 *
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="请输入成员姓名"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
              className="border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-500" />
                电话
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="138-0000-0000"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="wechat" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-slate-500" />
                微信
              </Label>
              <Input
                id="wechat"
                type="text"
                placeholder="微信号"
                value={formData.wechat}
                onChange={(e) => handleChange('wechat', e.target.value)}
                className="border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="joinDate" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-500" />
                入职日期
              </Label>
              <Input
                id="joinDate"
                type="date"
                value={formData.joinDate}
                onChange={(e) => handleChange('joinDate', e.target.value)}
                className="border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-medium text-slate-700">状态</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange('status', value)}
              >
                <SelectTrigger className="border-slate-200 focus:border-indigo-500 focus:ring-indigo-500">
                  <SelectValue placeholder="选择状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">在职</SelectItem>
                  <SelectItem value="inactive">离职</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              {editingMember ? '更新成员' : '添加成员'}
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
