import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { TeamMemberAnnualGoal } from '@/types/team';
import { 
  Target, 
  TrendingUp, 
  ShoppingBag, 
  Plane, 
  Award,
  Users,
  Handshake,
  CreditCard,
  Calendar,
  Edit3,
  BookOpen,
  Heart,
  Sparkles
} from 'lucide-react';

interface TeamMemberGoalsFormProps {
  memberId: string;
  onSubmit: (goal: Omit<TeamMemberAnnualGoal, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => void;
  editingGoal?: TeamMemberAnnualGoal | null;
  onCancel?: () => void;
}

export const TeamMemberGoalsForm = ({ 
  memberId, 
  onSubmit, 
  editingGoal, 
  onCancel 
}: TeamMemberGoalsFormProps) => {
  const currentYear = new Date().getFullYear();
  const [activeTab, setActiveTab] = useState<'breakdown' | 'execution' | 'qualitative'>('breakdown');
  
  const [formData, setFormData] = useState({
    memberId: memberId || '',
    year: currentYear,
    breakdownGoals: {
      income: 0,
      level: '',
      orderCount: 0,
      retailVolume: 0,
      travelGoal: '',
    },
    executionGoals: {
      newLeads: 0,
      visitCount: 0,
      new5ALeads: 0,
      visit5ACount: 0,
      salonInviteCount: 0,
      引流CardCount: 0,
    },
    qualitativeGoals: {
      learningGoal: '',
      healthGoal: '',
      relationshipGoal: '',
      hobbyGoal: '',
    },
  });

  const [isEditing, setIsEditing] = useState(false);

  // 当 memberId 改变时更新表单数据
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      memberId: memberId || '',
    }));
  }, [memberId]);

  // 当 editingGoal 改变时加载数据
  useEffect(() => {
    if (editingGoal) {
      setFormData({
        memberId: editingGoal.memberId,
        year: editingGoal.year,
        breakdownGoals: { ...editingGoal.breakdownGoals },
        executionGoals: { ...editingGoal.executionGoals },
        qualitativeGoals: editingGoal.qualitativeGoals ? { ...editingGoal.qualitativeGoals } : {
          learningGoal: '',
          healthGoal: '',
          relationshipGoal: '',
          hobbyGoal: '',
        },
      });
      setIsEditing(true);
    } else {
      // 重置表单
      setFormData({
        memberId: memberId || '',
        year: currentYear,
        breakdownGoals: {
          income: 0,
          level: '',
          orderCount: 0,
          retailVolume: 0,
          travelGoal: '',
        },
        executionGoals: {
          newLeads: 0,
          visitCount: 0,
          new5ALeads: 0,
          visit5ACount: 0,
          salonInviteCount: 0,
          引流CardCount: 0,
        },
        qualitativeGoals: {
          learningGoal: '',
          healthGoal: '',
          relationshipGoal: '',
          hobbyGoal: '',
        },
      });
      setIsEditing(false);
    }
  }, [editingGoal, memberId, currentYear]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.memberId) {
      alert('请先选择团队成员');
      return;
    }
    // 如果是编辑模式，添加id
    if (isEditing && editingGoal) {
      onSubmit({ ...formData, id: editingGoal.id });
    } else {
      onSubmit(formData);
    }
    // 提交后重置表单
    if (!isEditing) {
      setFormData({
        memberId: memberId || '',
        year: currentYear,
        breakdownGoals: {
          income: 0,
          level: '',
          orderCount: 0,
          retailVolume: 0,
          travelGoal: '',
        },
        executionGoals: {
          newLeads: 0,
          visitCount: 0,
          new5ALeads: 0,
          visit5ACount: 0,
          salonInviteCount: 0,
          引流CardCount: 0,
        },
        qualitativeGoals: {
          learningGoal: '',
          healthGoal: '',
          relationshipGoal: '',
          hobbyGoal: '',
        },
      });
    }
  };

  const handleBreakdownChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      breakdownGoals: {
        ...prev.breakdownGoals,
        [field]: value,
      },
    }));
  };

  const handleExecutionChange = (field: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      executionGoals: {
        ...prev.executionGoals,
        [field]: value,
      },
    }));
  };

  const handleQualitativeChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      qualitativeGoals: {
        ...prev.qualitativeGoals,
        [field]: value,
      },
    }));
  };

  return (
    <Card className="w-full shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-800">
          {isEditing ? (
            <Edit3 className="w-5 h-5 text-indigo-600" />
          ) : (
            <Target className="w-5 h-5 text-indigo-600" />
          )}
          {isEditing ? '编辑年度目标' : '设置年度目标'}
        </CardTitle>
        
        {/* 标签切换 */}
        <div className="flex gap-2 mt-4">
          <Button
            variant={activeTab === 'breakdown' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('breakdown')}
            className={activeTab === 'breakdown' 
              ? 'bg-indigo-600 hover:bg-indigo-700' 
              : 'border-slate-200 hover:bg-slate-50'
            }
          >
            拆解类目标
          </Button>
          <Button
            variant={activeTab === 'execution' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('execution')}
            className={activeTab === 'execution' 
              ? 'bg-indigo-600 hover:bg-indigo-700' 
              : 'border-slate-200 hover:bg-slate-50'
            }
          >
            执行类目标
          </Button>
          <Button
            variant={activeTab === 'qualitative' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('qualitative')}
            className={activeTab === 'qualitative' 
              ? 'bg-purple-600 hover:bg-purple-700' 
              : 'border-slate-200 hover:bg-slate-50'
            }
          >
            非量化指标
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 成员ID显示 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">成员ID</Label>
            <Input
              type="text"
              value={formData.memberId || '未选择'}
              disabled
              className="border-slate-200 bg-slate-50 text-slate-500"
            />
          </div>

          {/* 年份选择 */}
          <div className="space-y-2">
            <Label htmlFor="year" className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-500" />
              目标年份
            </Label>
            <Input
              id="year"
              type="number"
              value={formData.year}
              onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
              min={2020}
              max={2030}
              disabled={isEditing}
              className={isEditing ? 'border-slate-200 bg-slate-50 text-slate-400' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500'}
            />
          </div>

          {/* 拆解类目标 */}
          {activeTab === 'breakdown' && (
            <div className="space-y-5 p-5 bg-indigo-50/30 rounded-lg">
              <h3 className="font-medium text-slate-800 flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-600" />
                拆解类目标（业务指标）
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="income" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    年收入目标 (¥)
                  </Label>
                  <Input
                    id="income"
                    type="number"
                    placeholder="请输入年收入目标"
                    value={formData.breakdownGoals.income}
                    onChange={(e) => handleBreakdownChange('income', parseInt(e.target.value) || 0)}
                    min={0}
                    step={10000}
                    className="border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 bg-white"
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
                    value={formData.breakdownGoals.level}
                    onChange={(e) => handleBreakdownChange('level', e.target.value)}
                    className="border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="orderCount" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-blue-500" />
                    单量目标
                  </Label>
                  <Input
                    id="orderCount"
                    type="number"
                    placeholder="请输入年度单量目标"
                    value={formData.breakdownGoals.orderCount}
                    onChange={(e) => handleBreakdownChange('orderCount', parseInt(e.target.value) || 0)}
                    min={0}
                    className="border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 bg-white"
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
                    value={formData.breakdownGoals.retailVolume}
                    onChange={(e) => handleBreakdownChange('retailVolume', parseInt(e.target.value) || 0)}
                    min={0}
                    className="border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 bg-white"
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
                  value={formData.breakdownGoals.travelGoal}
                  onChange={(e) => handleBreakdownChange('travelGoal', e.target.value)}
                  rows={3}
                  className="border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 resize-none bg-white"
                />
              </div>
            </div>
          )}

          {/* 执行类目标 */}
          {activeTab === 'execution' && (
            <div className="space-y-5 p-5 bg-green-50/30 rounded-lg">
              <h3 className="font-medium text-slate-800 flex items-center gap-2">
                <Users className="w-4 h-4 text-green-600" />
                执行类目标（行动指标）
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="newLeads" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-500" />
                    新增名单（个）
                  </Label>
                  <Input
                    id="newLeads"
                    type="number"
                    placeholder="请输入年度新增名单目标"
                    value={formData.executionGoals.newLeads}
                    onChange={(e) => handleExecutionChange('newLeads', parseInt(e.target.value) || 0)}
                    min={0}
                    className="border-slate-200 focus:border-green-500 focus:ring-green-500 bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="visitCount" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Handshake className="w-4 h-4 text-purple-500" />
                    拜访名单人次（次）
                  </Label>
                  <Input
                    id="visitCount"
                    type="number"
                    placeholder="请输入年度拜访人次目标"
                    value={formData.executionGoals.visitCount}
                    onChange={(e) => handleExecutionChange('visitCount', parseInt(e.target.value) || 0)}
                    min={0}
                    className="border-slate-200 focus:border-green-500 focus:ring-green-500 bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new5ALeads" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Users className="w-4 h-4 text-amber-500" />
                    新增5A名单（个）
                  </Label>
                  <Input
                    id="new5ALeads"
                    type="number"
                    placeholder="请输入年度新增5A名单目标"
                    value={formData.executionGoals.new5ALeads}
                    onChange={(e) => handleExecutionChange('new5ALeads', parseInt(e.target.value) || 0)}
                    min={0}
                    className="border-slate-200 focus:border-green-500 focus:ring-green-500 bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="visit5ACount" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Handshake className="w-4 h-4 text-red-500" />
                    拜访5A人次（次）
                  </Label>
                  <Input
                    id="visit5ACount"
                    type="number"
                    placeholder="请输入年度拜访5A人次目标"
                    value={formData.executionGoals.visit5ACount}
                    onChange={(e) => handleExecutionChange('visit5ACount', parseInt(e.target.value) || 0)}
                    min={0}
                    className="border-slate-200 focus:border-green-500 focus:ring-green-500 bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salonInviteCount" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-500" />
                    邀约沙龙/会所人次（次）
                  </Label>
                  <Input
                    id="salonInviteCount"
                    type="number"
                    placeholder="请输入年度邀约沙龙/会所人次目标"
                    value={formData.executionGoals.salonInviteCount}
                    onChange={(e) => handleExecutionChange('salonInviteCount', parseInt(e.target.value) || 0)}
                    min={0}
                    className="border-slate-200 focus:border-green-500 focus:ring-green-500 bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="引流CardCount" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-cyan-500" />
                    引流卡量（张）
                  </Label>
                  <Input
                    id="引流CardCount"
                    type="number"
                    placeholder="请输入年度引流卡量目标"
                    value={formData.executionGoals.引流CardCount}
                    onChange={(e) => handleExecutionChange('引流CardCount', parseInt(e.target.value) || 0)}
                    min={0}
                    className="border-slate-200 focus:border-green-500 focus:ring-green-500 bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 非量化指标目标 */}
          {activeTab === 'qualitative' && (
            <div className="space-y-5 p-5 bg-purple-50/30 rounded-lg">
              <h3 className="font-medium text-slate-800 flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-600" />
                非量化指标目标
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="learningGoal" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-purple-500" />
                    学习目标
                  </Label>
                  <Textarea
                    id="learningGoal"
                    placeholder="例如：阅读12本专业书籍，完成2门在线课程..."
                    value={formData.qualitativeGoals.learningGoal}
                    onChange={(e) => handleQualitativeChange('learningGoal', e.target.value)}
                    rows={3}
                    className="border-slate-200 focus:border-purple-500 focus:ring-purple-500 resize-none bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="healthGoal" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-500" />
                    健康目标
                  </Label>
                  <Textarea
                    id="healthGoal"
                    placeholder="例如：每周运动3次，保持健康体重..."
                    value={formData.qualitativeGoals.healthGoal}
                    onChange={(e) => handleQualitativeChange('healthGoal', e.target.value)}
                    rows={3}
                    className="border-slate-200 focus:border-purple-500 focus:ring-purple-500 resize-none bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="relationshipGoal" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-500" />
                    关系目标
                  </Label>
                  <Textarea
                    id="relationshipGoal"
                    placeholder="例如：每月至少组织1次家庭聚会，维护客户关系..."
                    value={formData.qualitativeGoals.relationshipGoal}
                    onChange={(e) => handleQualitativeChange('relationshipGoal', e.target.value)}
                    rows={3}
                    className="border-slate-200 focus:border-purple-500 focus:ring-purple-500 resize-none bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hobbyGoal" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    爱好目标
                  </Label>
                  <Textarea
                    id="hobbyGoal"
                    placeholder="例如：学习一门乐器，旅行3个新地方..."
                    value={formData.qualitativeGoals.hobbyGoal}
                    onChange={(e) => handleQualitativeChange('hobbyGoal', e.target.value)}
                    rows={3}
                    className="border-slate-200 focus:border-purple-500 focus:ring-purple-500 resize-none bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              {isEditing ? '更新目标' : '创建目标'}
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
