import { useState, useEffect } from 'react';
import { useTeamCloudBase } from '@/hooks/useTeamCloudBase';
import { TeamMemberForm } from '@/sections/TeamMemberForm';
import { TeamMemberList } from '@/sections/TeamMemberList';
import { TeamMemberGoalsForm } from '@/sections/TeamMemberGoalsForm';
import { TeamMemberDetail } from '@/sections/TeamMemberDetail';
import { TeamDashboard } from '@/sections/TeamDashboard';
import { TeamSharePanel } from '@/sections/TeamSharePanel';
import { DebugPanel } from '@/sections/DebugPanel';
import { exportTeamDataToExcel } from '@/utils/exportUtils';
import type { TeamMember, TeamMemberAnnualGoal } from '@/types/team';
import { 
  Users, 
  LayoutDashboard,
  Sparkles,
  TrendingUp,
  Target,
  Plus,
  ChevronUp,
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle2,
  Bug,
  FileSpreadsheet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import './App.css';

// 扩展现有的标签类型
type TabType = 'dashboard' | 'team' | 'member-detail';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [selectedMemberIdForGoal, setSelectedMemberIdForGoal] = useState<string>('');
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<TeamMemberAnnualGoal | null>(null);
  
  const {
    members,
    annualGoals,
    monthlyGoals,
    weeklyGoals,
    isLoading,
    teamCode,
    isOnline,
    isCloudConnected,
    syncStatus,
    debugLogs,
    showDebugPanel,
    setShowDebugPanel,
    createMember,
    updateMember,
    deleteMember,
    createAnnualGoal,
    updateAnnualGoal,
    updateAnnualGoalActual,
    deleteAnnualGoal,
    createMonthlyGoal,
    updateMonthlyGoal,
    updateMonthlyGoalActual,
    deleteMonthlyGoal,
    createWeeklyGoal,
    updateWeeklyGoal,
    updateWeeklyGoalActual,
    deleteWeeklyGoal,
    getMemberProgress,
    getTeamStats,
    getShareLink,
    refreshData,
    clearDebugLogs,
    checkCloudConnection,
  } = useTeamCloudBase();

  const teamStats = getTeamStats();

  // 获取所有成员的进度
  const memberProgress: Record<string, ReturnType<typeof getMemberProgress>> = {};
  members.forEach(member => {
    memberProgress[member.id] = getMemberProgress(member.id);
  });

  // 当成员列表变化时，更新选中的成员ID
  useEffect(() => {
    if (members.length > 0 && !selectedMemberIdForGoal) {
      setSelectedMemberIdForGoal(members[0].id);
    }
  }, [members, selectedMemberIdForGoal]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
          <p className="text-slate-500">加载中...</p>
        </div>
      </div>
    );
  }

  // 处理成员提交
  const handleMemberSubmit = async (member: Omit<TeamMember, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingMember) {
      await updateMember(editingMember.id, member);
      setEditingMember(null);
    } else {
      const newMember = await createMember(member);
      // 自动选中新创建的成员
      if (newMember) {
        setSelectedMemberIdForGoal(newMember.id);
      }
    }
  };

  // 处理成员目标提交
  const handleMemberGoalSubmit = async (goal: Parameters<typeof createAnnualGoal>[0] & { id?: string }) => {
    if (goal.id) {
      // 更新现有目标
      await updateAnnualGoal(goal.id, goal);
    } else {
      // 创建新目标
      await createAnnualGoal(goal);
    }
    setShowGoalForm(false);
    setEditingGoal(null);
  };

  // 处理编辑目标
  const handleEditGoal = (goal: TeamMemberAnnualGoal) => {
    setEditingGoal(goal);
    setSelectedMemberIdForGoal(goal.memberId);
    setShowGoalForm(true);
  };

  // 处理创建目标
  const handleCreateGoal = (memberId: string) => {
    setSelectedMemberIdForGoal(memberId);
    setEditingGoal(null);
    setShowGoalForm(true);
  };

  // 处理删除目标
  const handleDeleteGoal = async (goalId: string) => {
    await deleteAnnualGoal(goalId);
  };

  // 处理更新月度实际完成
  const handleUpdateMonthlyActual = async (id: string, actualBreakdown: any, actualExecution: any) => {
    await updateMonthlyGoalActual(id, actualBreakdown, actualExecution);
  };

  // 处理更新周别实际完成
  const handleUpdateWeeklyActual = async (id: string, actualBreakdown: any, actualExecution: any) => {
    await updateWeeklyGoalActual(id, actualBreakdown, actualExecution);
  };

  // 处理更新年度实际完成
  const handleUpdateAnnualActual = async (id: string, actualBreakdown: any, actualExecution: any) => {
    await updateAnnualGoalActual(id, actualBreakdown, actualExecution);
  };

  // 处理删除月度目标
  const handleDeleteMonthlyGoal = async (id: string) => {
    await deleteMonthlyGoal(id);
  };

  // 处理删除周目标
  const handleDeleteWeeklyGoal = async (id: string) => {
    await deleteWeeklyGoal(id);
  };

  // 处理更新月度目标
  const handleUpdateMonthlyGoal = async (id: string, breakdownGoals: any, executionGoals: any) => {
    await updateMonthlyGoal(id, { breakdownGoals, executionGoals });
  };

  // 处理更新周目标
  const handleUpdateWeeklyGoal = async (id: string, breakdownGoals: any, executionGoals: any) => {
    await updateWeeklyGoal(id, { breakdownGoals, executionGoals });
  };

  // 处理创建月度目标
  const handleCreateMonthlyGoal = async (memberId: string, year: number, month: number, monthISO: string, breakdownGoals: any, executionGoals: any) => {
    await createMonthlyGoal({
      memberId,
      annualGoalId: '',
      year,
      month,
      monthISO,
      breakdownGoals,
      executionGoals,
    });
  };

  // 处理创建周目标
  const handleCreateWeeklyGoal = async (memberId: string, year: number, month: number, week: number, weekISO: string, weekStartDate: string, weekEndDate: string, breakdownGoals: any, executionGoals: any) => {
    await createWeeklyGoal({
      memberId,
      monthlyGoalId: '',
      year,
      month,
      week,
      weekISO,
      weekStartDate,
      weekEndDate,
      breakdownGoals,
      executionGoals,
    });
  };

  // 处理选择成员
  const handleSelectMember = (member: TeamMember) => {
    setSelectedMember(member);
    setActiveTab('member-detail');
  };

  // 处理返回团队列表
  const handleBackToTeam = () => {
    setSelectedMember(null);
    setActiveTab('team');
  };

  // 导出 Excel
  const handleExportExcel = () => {
    exportTeamDataToExcel(members, annualGoals, monthlyGoals, weeklyGoals, memberProgress);
  };

  // 渲染同步状态图标
  const renderSyncStatus = () => {
    if (!isOnline) {
      return (
        <div className="flex items-center gap-1.5 px-2 py-1 bg-red-50 rounded-lg">
          <WifiOff className="w-3.5 h-3.5 text-red-500" />
          <span className="text-xs font-medium text-red-600">离线</span>
        </div>
      );
    }

    switch (syncStatus) {
      case 'syncing':
        return (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 rounded-lg">
            <RefreshCw className="w-3.5 h-3.5 text-blue-500 animate-spin" />
            <span className="text-xs font-medium text-blue-600">同步中</span>
          </div>
        );
      case 'synced':
        return (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 rounded-lg">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
            <span className="text-xs font-medium text-green-600">已同步</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-50 rounded-lg">
            <Wifi className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-xs font-medium text-amber-600">同步失败</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">团队目标管理系统</h1>
                <p className="text-xs text-slate-500">拆解类 + 执行类 · 多成员 · 数据可视化 · 实时同步</p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-2">
              {renderSyncStatus()}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-lg">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">
                  团队 {teamStats.avgBreakdownProgress.toFixed(1)}% 完成
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-lg">
                <Target className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-700">
                  {teamStats.activeMembers} 人在职
                </span>
              </div>
              {/* 导出按钮 */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportExcel}
                className="flex items-center gap-1.5 ml-2"
              >
                <FileSpreadsheet className="w-4 h-4" />
                导出Excel
              </Button>
              {/* 调试按钮 */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDebugPanel(true)}
                className="flex items-center gap-1.5"
              >
                <Bug className="w-4 h-4 text-amber-500" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <TeamTabNavigation 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          onBackToTeam={handleBackToTeam}
          showMemberDetail={activeTab === 'member-detail'}
        />
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full mb-4">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-medium text-indigo-700">团队数据 · 目标可视化 · 实时同步</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">团队目标数据看板</h2>
              <p className="text-slate-500 max-w-2xl mx-auto">
                实时监控团队成员的目标完成情况，包含拆解类目标（业务指标）和执行类目标（行动指标）。数据自动同步给所有团队成员。
              </p>
            </div>
            
            {/* 团队分享面板 */}
            <TeamSharePanel 
              teamCode={teamCode} 
              shareLink={getShareLink()}
              isOnline={isOnline}
            />
            
            <TeamDashboard 
              stats={teamStats} 
              members={members}
              memberProgress={memberProgress}
            />
          </div>
        )}

        {/* Team Tab */}
        {activeTab === 'team' && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">团队管理</h2>
              <p className="text-slate-500 max-w-2xl mx-auto">
                管理团队成员，为每个成员设置年度目标，追踪他们的拆解类和执行类目标完成情况
              </p>
            </div>
            
            {/* 团队分享面板 */}
            <TeamSharePanel 
              teamCode={teamCode} 
              shareLink={getShareLink()}
              isOnline={isOnline}
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <TeamMemberForm
                  onSubmit={handleMemberSubmit}
                  editingMember={editingMember}
                  onCancel={() => setEditingMember(null)}
                />
                
                {/* 成员选择器 + 目标表单 */}
                <Card className="shadow-lg">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-800">
                        <Target className="w-5 h-5 text-indigo-600" />
                        设置年度目标
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowGoalForm(!showGoalForm)}
                        className="flex items-center gap-1"
                      >
                        {showGoalForm ? '收起' : '展开'}
                        {showGoalForm ? <ChevronUp className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      </Button>
                    </div>
                  </CardHeader>
                  
                  {showGoalForm && (
                    <CardContent>
                      {/* 成员选择器 */}
                      <div className="space-y-2 mb-4">
                        <Label className="text-sm font-medium text-slate-700">选择团队成员</Label>
                        <Select
                          value={selectedMemberIdForGoal}
                          onValueChange={setSelectedMemberIdForGoal}
                        >
                          <SelectTrigger className="border-slate-200 focus:border-indigo-500 focus:ring-indigo-500">
                            <SelectValue placeholder="选择团队成员" />
                          </SelectTrigger>
                          <SelectContent>
                            {members.length === 0 ? (
                              <SelectItem value="" disabled>暂无团队成员</SelectItem>
                            ) : (
                              members.map(member => (
                                <SelectItem key={member.id} value={member.id}>
                                  {member.name} ({member.department || '未设置部门'})
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* 目标表单 */}
                      {selectedMemberIdForGoal && (
                        <TeamMemberGoalsForm
                          memberId={selectedMemberIdForGoal}
                          onSubmit={handleMemberGoalSubmit}
                          editingGoal={editingGoal}
                          onCancel={() => {
                            setEditingGoal(null);
                            setShowGoalForm(false);
                          }}
                        />
                      )}
                    </CardContent>
                  )}
                </Card>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-semibold text-slate-800">团队成员列表</h3>
                  <span className="ml-auto text-sm text-slate-500">
                    {members.length} 人 / {teamStats.activeMembers} 人在职
                  </span>
                </div>
                <TeamMemberList
                  members={members}
                  memberProgress={memberProgress}
                  annualGoals={annualGoals}
                  onEdit={setEditingMember}
                  onDelete={deleteMember}
                  onSelectMember={handleSelectMember}
                  onEditGoal={handleEditGoal}
                  onCreateGoal={handleCreateGoal}
                  onDeleteGoal={handleDeleteGoal}
                />
              </div>
            </div>
          </div>
        )}

        {/* Member Detail Tab */}
        {activeTab === 'member-detail' && selectedMember && (
          <div className="animate-fade-in">
            <TeamMemberDetail
              member={selectedMember}
              progress={memberProgress[selectedMember.id] || {
                memberId: selectedMember.id,
                memberName: selectedMember.name,
                annualBreakdownProgress: 0,
                annualExecutionProgress: 0,
                monthlyBreakdownProgress: 0,
                monthlyExecutionProgress: 0,
                weeklyBreakdownProgress: 0,
                weeklyExecutionProgress: 0,
                totalAnnualGoals: 0,
                completedAnnualGoals: 0,
                totalMonthlyGoals: 0,
                completedMonthlyGoals: 0,
                totalWeeklyGoals: 0,
                completedWeeklyGoals: 0,
              }}
              annualGoals={annualGoals.filter(g => g.memberId === selectedMember.id)}
              monthlyGoals={monthlyGoals.filter(g => g.memberId === selectedMember.id)}
              weeklyGoals={weeklyGoals.filter(g => g.memberId === selectedMember.id)}
              onUpdateMonthlyActual={handleUpdateMonthlyActual}
              onUpdateWeeklyActual={handleUpdateWeeklyActual}
              onUpdateAnnualActual={handleUpdateAnnualActual}
              onUpdateMonthlyGoal={handleUpdateMonthlyGoal}
              onUpdateWeeklyGoal={handleUpdateWeeklyGoal}
              onCreateMonthlyGoal={handleCreateMonthlyGoal}
              onCreateWeeklyGoal={handleCreateWeeklyGoal}
              onDeleteMonthlyGoal={handleDeleteMonthlyGoal}
              onDeleteWeeklyGoal={handleDeleteWeeklyGoal}
              onBack={handleBackToTeam}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Users className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm text-slate-600">
                团队目标管理系统 · 拆解类 + 执行类 · 数据可视化 · 腾讯云 CloudBase 实时同步
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {new Date().getFullYear()} 团队目标管理系统 · 让团队目标清晰可见
            </p>
          </div>
        </div>
      </footer>

      {/* Debug Panel */}
      <DebugPanel
        isOpen={showDebugPanel}
        onClose={() => setShowDebugPanel(false)}
        debugLogs={debugLogs}
        isOnline={isOnline}
        isCloudConnected={isCloudConnected}
        syncStatus={syncStatus}
        teamCode={teamCode}
        membersCount={members.length}
        annualGoalsCount={annualGoals.length}
        monthlyGoalsCount={monthlyGoals.length}
        weeklyGoalsCount={weeklyGoals.length}
        onRefresh={refreshData}
        onClearLogs={clearDebugLogs}
        onCheckConnection={checkCloudConnection}
      />
    </div>
  );
}

// 团队标签导航组件
interface TeamTabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onBackToTeam: () => void;
  showMemberDetail: boolean;
}

const TeamTabNavigation = ({ 
  activeTab, 
  onTabChange, 
  onBackToTeam,
  showMemberDetail 
}: TeamTabNavigationProps) => {
  const tabs = [
    { id: 'dashboard', label: '团队看板', icon: LayoutDashboard },
    { id: 'team', label: '团队管理', icon: Users },
  ];

  return (
    <div className="flex flex-wrap gap-2 p-2 bg-slate-100 rounded-xl">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <Button
            key={tab.id}
            variant={isActive ? 'default' : 'ghost'}
            onClick={() => onTabChange(tab.id as TabType)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
              ${isActive 
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md' 
                : 'text-slate-600 hover:bg-white hover:text-slate-800 hover:shadow-sm'
              }
            `}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </Button>
        );
      })}
      
      {showMemberDetail && (
        <Button
          variant="outline"
          onClick={onBackToTeam}
          className="ml-auto border-indigo-200 text-indigo-600 hover:bg-indigo-50 flex items-center gap-2"
        >
          <Users className="w-4 h-4" />
          <span className="hidden sm:inline">返回团队</span>
        </Button>
      )}
    </div>
  );
};

export default App;
