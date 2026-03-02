import { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import type { TeamStats, MemberProgress, TeamMember } from '@/types/team';
import { 
  Users, 
  Target, 
  TrendingUp, 
  Award,
  Calendar,
  CalendarDays,
  Download,
  BarChart3
} from 'lucide-react';
import { ProgressChart, type ProgressChartRef } from './ProgressChart';

interface TeamDashboardProps {
  stats: TeamStats;
  members: TeamMember[];
  memberProgress: Record<string, MemberProgress>;
}

export const TeamDashboard = ({ stats, members, memberProgress }: TeamDashboardProps) => {
  const chartRef = useRef<ProgressChartRef>(null);

  // 准备成员进度图表数据
  const memberChartData = members
    .filter(m => m.status === 'active')
    .map(member => ({
      label: member.name,
      breakdownProgress: memberProgress[member.id]?.annualBreakdownProgress || 0,
      executionProgress: memberProgress[member.id]?.annualExecutionProgress || 0,
    }))
    .sort((a, b) => b.breakdownProgress - a.breakdownProgress);

  // 导出团队进度数据
  const handleExportTeamProgress = () => {
    const exportData = members.map(member => {
      const progress = memberProgress[member.id];
      return {
        成员姓名: member.name,
        状态: member.status === 'active' ? '在职' : '离职',
        年度拆解进度: `${(progress?.annualBreakdownProgress || 0).toFixed(1)}%`,
        年度执行进度: `${(progress?.annualExecutionProgress || 0).toFixed(1)}%`,
        月度拆解进度: `${(progress?.monthlyBreakdownProgress || 0).toFixed(1)}%`,
        月度执行进度: `${(progress?.monthlyExecutionProgress || 0).toFixed(1)}%`,
        周拆解进度: `${(progress?.weeklyBreakdownProgress || 0).toFixed(1)}%`,
        周执行进度: `${(progress?.weeklyExecutionProgress || 0).toFixed(1)}%`,
      };
    });

    const headers = Object.keys(exportData[0] || {});
    const csvContent = [
      headers.join(','),
      ...exportData.map(row => headers.map(h => row[h as keyof typeof row]).join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `团队完成进度_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // 导出团队图表
  const handleExportChart = () => {
    chartRef.current?.exportImage(`团队完成进度_${new Date().toISOString().split('T')[0]}.png`);
  };

  return (
    <div className="space-y-6">
      {/* 关键指标卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">团队成员</p>
                <p className="text-3xl font-bold text-slate-800">{stats.totalMembers}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-slate-500">在职:</span>
              <span className="text-sm font-medium text-green-600">{stats.activeMembers}人</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">年度拆解进度</p>
                <p className="text-3xl font-bold text-indigo-600">
                  {stats.avgBreakdownProgress.toFixed(1)}%
                </p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
            <div className="mt-4">
              <Progress value={stats.avgBreakdownProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">年度执行进度</p>
                <p className="text-3xl font-bold text-green-600">
                  {stats.avgExecutionProgress.toFixed(1)}%
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <Progress value={stats.avgExecutionProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">总目标数</p>
                <p className="text-3xl font-bold text-slate-800">
                  {stats.totalAnnualGoals + stats.totalMonthlyGoals + stats.totalWeeklyGoals}
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-amber-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3 text-xs text-slate-500">
              <span>年:{stats.totalAnnualGoals}</span>
              <span>月:{stats.totalMonthlyGoals}</span>
              <span>周:{stats.totalWeeklyGoals}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 团队进度图表 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            团队成员完成进度对比
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportChart} className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              导出图表
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportTeamProgress} className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              导出数据
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ProgressChart 
            ref={chartRef}
            data={memberChartData} 
            title="各成员年度目标完成进度" 
            type="bar" 
          />
        </CardContent>
      </Card>

      {/* 成员进度列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="w-5 h-5 text-indigo-600" />
            成员详细进度
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {members
              .filter(m => m.status === 'active')
              .sort((a, b) => (memberProgress[b.id]?.annualBreakdownProgress || 0) - (memberProgress[a.id]?.annualBreakdownProgress || 0))
              .map((member, index) => {
                const progress = memberProgress[member.id];
                if (!progress) return null;

                return (
                  <div key={member.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-600">
                      {index + 1}
                    </div>
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback className="bg-indigo-100 text-indigo-700 text-sm">
                        {member.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-slate-800">{member.name}</p>
                      <div className="flex gap-4 mt-2">
                        <div className="flex-1">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-500">年度拆解</span>
                            <span className="font-medium text-indigo-600">{progress.annualBreakdownProgress.toFixed(1)}%</span>
                          </div>
                          <Progress value={progress.annualBreakdownProgress} className="h-1.5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-500">年度执行</span>
                            <span className="font-medium text-green-600">{progress.annualExecutionProgress.toFixed(1)}%</span>
                          </div>
                          <Progress value={progress.annualExecutionProgress} className="h-1.5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-500">月度拆解</span>
                            <span className="font-medium text-purple-600">{progress.monthlyBreakdownProgress.toFixed(1)}%</span>
                          </div>
                          <Progress value={progress.monthlyBreakdownProgress} className="h-1.5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-500">周拆解</span>
                            <span className="font-medium text-amber-600">{progress.weeklyBreakdownProgress.toFixed(1)}%</span>
                          </div>
                          <Progress value={progress.weeklyBreakdownProgress} className="h-1.5" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>

      {/* 各层级进度汇总 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="w-4 h-4 text-indigo-600" />
              年度目标进度
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">拆解进度</span>
                  <span className="font-medium text-indigo-600">{stats.avgBreakdownProgress.toFixed(1)}%</span>
                </div>
                <Progress value={stats.avgBreakdownProgress} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">执行进度</span>
                  <span className="font-medium text-green-600">{stats.avgExecutionProgress.toFixed(1)}%</span>
                </div>
                <Progress value={stats.avgExecutionProgress} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="w-4 h-4 text-purple-600" />
              月度目标进度
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">拆解进度</span>
                  <span className="font-medium text-purple-600">{stats.avgMonthlyBreakdownProgress?.toFixed(1) || '0.0'}%</span>
                </div>
                <Progress value={stats.avgMonthlyBreakdownProgress || 0} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">执行进度</span>
                  <span className="font-medium text-green-600">{stats.avgMonthlyExecutionProgress?.toFixed(1) || '0.0'}%</span>
                </div>
                <Progress value={stats.avgMonthlyExecutionProgress || 0} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarDays className="w-4 h-4 text-amber-600" />
              周目标进度
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">拆解进度</span>
                  <span className="font-medium text-amber-600">
                    {(() => {
                      let total = 0;
                      let count = 0;
                      Object.values(memberProgress).forEach(p => {
                        total += p.weeklyBreakdownProgress;
                        count++;
                      });
                      return count > 0 ? (total / count).toFixed(1) : '0.0';
                    })()}%
                  </span>
                </div>
                <Progress 
                  value={(() => {
                    let total = 0;
                    let count = 0;
                    Object.values(memberProgress).forEach(p => {
                      total += p.weeklyBreakdownProgress;
                      count++;
                    });
                    return count > 0 ? total / count : 0;
                  })()} 
                  className="h-2" 
                />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">执行进度</span>
                  <span className="font-medium text-green-600">
                    {(() => {
                      let total = 0;
                      let count = 0;
                      Object.values(memberProgress).forEach(p => {
                        total += p.weeklyExecutionProgress;
                        count++;
                      });
                      return count > 0 ? (total / count).toFixed(1) : '0.0';
                    })()}%
                  </span>
                </div>
                <Progress 
                  value={(() => {
                    let total = 0;
                    let count = 0;
                    Object.values(memberProgress).forEach(p => {
                      total += p.weeklyExecutionProgress;
                      count++;
                    });
                    return count > 0 ? total / count : 0;
                  })()} 
                  className="h-2" 
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
