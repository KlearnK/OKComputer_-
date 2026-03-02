import * as XLSX from 'xlsx';
import type { 
  TeamMember, 
  TeamMemberAnnualGoal, 
  TeamMemberMonthlyGoal, 
  TeamMemberWeeklyGoal,
  MemberProgress
} from '@/types/team';

/**
 * 导出团队数据为 Excel 文件
 */
export const exportTeamDataToExcel = (
  members: TeamMember[],
  annualGoals: TeamMemberAnnualGoal[],
  monthlyGoals: TeamMemberMonthlyGoal[],
  weeklyGoals: TeamMemberWeeklyGoal[],
  memberProgress: Record<string, MemberProgress>
) => {
  const workbook = XLSX.utils.book_new();

  // 1. 成员列表工作表
  const membersSheet = createMembersSheet(members);
  XLSX.utils.book_append_sheet(workbook, membersSheet, '团队成员');

  // 2. 年度目标工作表
  const annualGoalsSheet = createAnnualGoalsSheet(annualGoals, members);
  XLSX.utils.book_append_sheet(workbook, annualGoalsSheet, '年度目标');

  // 3. 月度目标工作表
  const monthlyGoalsSheet = createMonthlyGoalsSheet(monthlyGoals, members);
  XLSX.utils.book_append_sheet(workbook, monthlyGoalsSheet, '月度目标');

  // 4. 周目标工作表
  const weeklyGoalsSheet = createWeeklyGoalsSheet(weeklyGoals, members);
  XLSX.utils.book_append_sheet(workbook, weeklyGoalsSheet, '周目标');

  // 5. 成员进度统计工作表
  const progressSheet = createProgressSheet(members, memberProgress);
  XLSX.utils.book_append_sheet(workbook, progressSheet, '进度统计');

  // 6. 团队汇总工作表
  const summarySheet = createSummarySheet(members, annualGoals, monthlyGoals, weeklyGoals, memberProgress);
  XLSX.utils.book_append_sheet(workbook, summarySheet, '团队汇总');

  // 导出文件
  const timestamp = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `团队目标数据_${timestamp}.xlsx`);
};

/**
 * 创建成员列表工作表
 */
const createMembersSheet = (members: TeamMember[]) => {
  const data = members.map(member => ({
    'ID': member.id,
    '姓名': member.name,
    '部门': member.department || '-',
    '职位': member.role || '-',
    '电话': member.phone,
    '微信': member.wechat || '-',
    '入职日期': member.joinDate,
    '状态': member.status === 'active' ? '在职' : '离职',
    '创建时间': member.createdAt,
    '更新时间': member.updatedAt,
  }));

  return XLSX.utils.json_to_sheet(data);
};

/**
 * 创建年度目标工作表
 */
const createAnnualGoalsSheet = (goals: TeamMemberAnnualGoal[], members: TeamMember[]) => {
  const data = goals.map(goal => {
    const member = members.find(m => m.id === goal.memberId);
    return {
      'ID': goal.id,
      '成员': member?.name || '-',
      '年份': goal.year,
      // 拆解类目标
      '收入目标': goal.breakdownGoals.income,
      '级别目标': goal.breakdownGoals.level,
      '单量目标': goal.breakdownGoals.orderCount,
      '零售量目标': goal.breakdownGoals.retailVolume,
      '旅游目标': goal.breakdownGoals.travelGoal,
      // 执行类目标
      '新增名单目标': goal.executionGoals.newLeads,
      '拜访人次目标': goal.executionGoals.visitCount,
      '新增5A名单目标': goal.executionGoals.new5ALeads,
      '拜访5A人次目标': goal.executionGoals.visit5ACount,
      '邀约沙龙人次目标': goal.executionGoals.salonInviteCount,
      '引流卡量目标': goal.executionGoals.引流CardCount,
      // 非量化指标
      '学习目标': goal.qualitativeGoals?.learningGoal || '-',
      '健康目标': goal.qualitativeGoals?.healthGoal || '-',
      '关系目标': goal.qualitativeGoals?.relationshipGoal || '-',
      '爱好目标': goal.qualitativeGoals?.hobbyGoal || '-',
      // 实际完成
      '实际收入': goal.actualBreakdown?.income || 0,
      '实际单量': goal.actualBreakdown?.orderCount || 0,
      '实际零售量': goal.actualBreakdown?.retailVolume || 0,
      '实际新增名单': goal.actualExecution?.newLeads || 0,
      '实际拜访人次': goal.actualExecution?.visitCount || 0,
      '实际新增5A': goal.actualExecution?.new5ALeads || 0,
      '实际拜访5A': goal.actualExecution?.visit5ACount || 0,
      '实际邀约沙龙': goal.actualExecution?.salonInviteCount || 0,
      '实际引流卡': goal.actualExecution?.引流CardCount || 0,
      '创建时间': goal.createdAt,
      '更新时间': goal.updatedAt,
    };
  });

  return XLSX.utils.json_to_sheet(data);
};

/**
 * 创建月度目标工作表
 */
const createMonthlyGoalsSheet = (goals: TeamMemberMonthlyGoal[], members: TeamMember[]) => {
  const data = goals.map(goal => {
    const member = members.find(m => m.id === goal.memberId);
    return {
      'ID': goal.id,
      '成员': member?.name || '-',
      '年份': goal.year,
      '月份': goal.month,
      '月份ISO': goal.monthISO,
      // 拆解类目标
      '收入目标': goal.breakdownGoals.income,
      '级别目标': goal.breakdownGoals.level,
      '单量目标': goal.breakdownGoals.orderCount,
      '零售量目标': goal.breakdownGoals.retailVolume,
      '旅游目标': goal.breakdownGoals.travelGoal,
      // 执行类目标
      '新增名单目标': goal.executionGoals.newLeads,
      '拜访人次目标': goal.executionGoals.visitCount,
      '新增5A名单目标': goal.executionGoals.new5ALeads,
      '拜访5A人次目标': goal.executionGoals.visit5ACount,
      '邀约沙龙人次目标': goal.executionGoals.salonInviteCount,
      '引流卡量目标': goal.executionGoals.引流CardCount,
      // 实际完成
      '实际收入': goal.actualBreakdown?.income || 0,
      '实际单量': goal.actualBreakdown?.orderCount || 0,
      '实际零售量': goal.actualBreakdown?.retailVolume || 0,
      '实际新增名单': goal.actualExecution?.newLeads || 0,
      '实际拜访人次': goal.actualExecution?.visitCount || 0,
      '实际新增5A': goal.actualExecution?.new5ALeads || 0,
      '实际拜访5A': goal.actualExecution?.visit5ACount || 0,
      '实际邀约沙龙': goal.actualExecution?.salonInviteCount || 0,
      '实际引流卡': goal.actualExecution?.引流CardCount || 0,
      '创建时间': goal.createdAt,
      '更新时间': goal.updatedAt,
    };
  });

  return XLSX.utils.json_to_sheet(data);
};

/**
 * 创建周目标工作表
 */
const createWeeklyGoalsSheet = (goals: TeamMemberWeeklyGoal[], members: TeamMember[]) => {
  const data = goals.map(goal => {
    const member = members.find(m => m.id === goal.memberId);
    return {
      'ID': goal.id,
      '成员': member?.name || '-',
      '年份': goal.year,
      '月份': goal.month,
      '周数': goal.week,
      '周ISO': goal.weekISO,
      '周开始日期': goal.weekStartDate,
      '周结束日期': goal.weekEndDate,
      // 拆解类目标
      '收入目标': goal.breakdownGoals.income,
      '级别目标': goal.breakdownGoals.level,
      '单量目标': goal.breakdownGoals.orderCount,
      '零售量目标': goal.breakdownGoals.retailVolume,
      '旅游目标': goal.breakdownGoals.travelGoal,
      // 执行类目标
      '新增名单目标': goal.executionGoals.newLeads,
      '拜访人次目标': goal.executionGoals.visitCount,
      '新增5A名单目标': goal.executionGoals.new5ALeads,
      '拜访5A人次目标': goal.executionGoals.visit5ACount,
      '邀约沙龙人次目标': goal.executionGoals.salonInviteCount,
      '引流卡量目标': goal.executionGoals.引流CardCount,
      // 实际完成
      '实际收入': goal.actualBreakdown?.income || 0,
      '实际单量': goal.actualBreakdown?.orderCount || 0,
      '实际零售量': goal.actualBreakdown?.retailVolume || 0,
      '实际新增名单': goal.actualExecution?.newLeads || 0,
      '实际拜访人次': goal.actualExecution?.visitCount || 0,
      '实际新增5A': goal.actualExecution?.new5ALeads || 0,
      '实际拜访5A': goal.actualExecution?.visit5ACount || 0,
      '实际邀约沙龙': goal.actualExecution?.salonInviteCount || 0,
      '实际引流卡': goal.actualExecution?.引流CardCount || 0,
      '创建时间': goal.createdAt,
      '更新时间': goal.updatedAt,
    };
  });

  return XLSX.utils.json_to_sheet(data);
};

/**
 * 创建进度统计工作表
 */
const createProgressSheet = (members: TeamMember[], memberProgress: Record<string, MemberProgress>) => {
  const data = members.map(member => {
    const progress = memberProgress[member.id];
    return {
      '成员ID': member.id,
      '姓名': member.name,
      '部门': member.department || '-',
      '状态': member.status === 'active' ? '在职' : '离职',
      // 年度进度
      '年度拆解进度(%)': progress?.annualBreakdownProgress?.toFixed(2) || 0,
      '年度执行进度(%)': progress?.annualExecutionProgress?.toFixed(2) || 0,
      // 月度进度
      '月度拆解进度(%)': progress?.monthlyBreakdownProgress?.toFixed(2) || 0,
      '月度执行进度(%)': progress?.monthlyExecutionProgress?.toFixed(2) || 0,
      // 周进度
      '周拆解进度(%)': progress?.weeklyBreakdownProgress?.toFixed(2) || 0,
      '周执行进度(%)': progress?.weeklyExecutionProgress?.toFixed(2) || 0,
      // 目标数量
      '年度目标数': progress?.totalAnnualGoals || 0,
      '已完成年度目标': progress?.completedAnnualGoals || 0,
      '月度目标数': progress?.totalMonthlyGoals || 0,
      '已完成月度目标': progress?.completedMonthlyGoals || 0,
      '周目标数': progress?.totalWeeklyGoals || 0,
      '已完成周目标': progress?.completedWeeklyGoals || 0,
    };
  });

  return XLSX.utils.json_to_sheet(data);
};

/**
 * 创建团队汇总工作表
 */
const createSummarySheet = (
  members: TeamMember[],
  annualGoals: TeamMemberAnnualGoal[],
  monthlyGoals: TeamMemberMonthlyGoal[],
  weeklyGoals: TeamMemberWeeklyGoal[],
  memberProgress: Record<string, MemberProgress>
) => {
  const activeMembers = members.filter(m => m.status === 'active');
  
  // 计算平均进度
  let totalAnnualBreakdownProgress = 0;
  let totalAnnualExecutionProgress = 0;
  let totalMonthlyBreakdownProgress = 0;
  let totalMonthlyExecutionProgress = 0;
  
  activeMembers.forEach(member => {
    const progress = memberProgress[member.id];
    if (progress) {
      totalAnnualBreakdownProgress += progress.annualBreakdownProgress;
      totalAnnualExecutionProgress += progress.annualExecutionProgress;
      totalMonthlyBreakdownProgress += progress.monthlyBreakdownProgress;
      totalMonthlyExecutionProgress += progress.monthlyExecutionProgress;
    }
  });

  const memberCount = activeMembers.length || 1;

  const data = [
    { '指标': '统计日期', '数值': new Date().toLocaleString('zh-CN') },
    { '指标': '', '数值': '' },
    { '指标': '=== 团队概况 ===', '数值': '' },
    { '指标': '总成员数', '数值': members.length },
    { '指标': '在职成员数', '数值': activeMembers.length },
    { '指标': '离职成员数', '数值': members.length - activeMembers.length },
    { '指标': '', '数值': '' },
    { '指标': '=== 目标统计 ===', '数值': '' },
    { '指标': '年度目标总数', '数值': annualGoals.length },
    { '指标': '月度目标总数', '数值': monthlyGoals.length },
    { '指标': '周目标总数', '数值': weeklyGoals.length },
    { '指标': '', '数值': '' },
    { '指标': '=== 平均进度 ===', '数值': '' },
    { '指标': '年度拆解进度(%)', '数值': (totalAnnualBreakdownProgress / memberCount).toFixed(2) },
    { '指标': '年度执行进度(%)', '数值': (totalAnnualExecutionProgress / memberCount).toFixed(2) },
    { '指标': '月度拆解进度(%)', '数值': (totalMonthlyBreakdownProgress / memberCount).toFixed(2) },
    { '指标': '月度执行进度(%)', '数值': (totalMonthlyExecutionProgress / memberCount).toFixed(2) },
  ];

  return XLSX.utils.json_to_sheet(data);
};

/**
 * 导出单个成员的数据
 */
export const exportMemberDataToExcel = (
  member: TeamMember,
  annualGoals: TeamMemberAnnualGoal[],
  monthlyGoals: TeamMemberMonthlyGoal[],
  weeklyGoals: TeamMemberWeeklyGoal[]
) => {
  const workbook = XLSX.utils.book_new();

  // 成员年度目标
  const memberAnnualGoals = annualGoals.filter(g => g.memberId === member.id);
  if (memberAnnualGoals.length > 0) {
    const annualSheet = createAnnualGoalsSheet(memberAnnualGoals, [member]);
    XLSX.utils.book_append_sheet(workbook, annualSheet, '年度目标');
  }

  // 成员月度目标
  const memberMonthlyGoals = monthlyGoals.filter(g => g.memberId === member.id);
  if (memberMonthlyGoals.length > 0) {
    const monthlySheet = createMonthlyGoalsSheet(memberMonthlyGoals, [member]);
    XLSX.utils.book_append_sheet(workbook, monthlySheet, '月度目标');
  }

  // 成员周目标
  const memberWeeklyGoals = weeklyGoals.filter(g => g.memberId === member.id);
  if (memberWeeklyGoals.length > 0) {
    const weeklySheet = createWeeklyGoalsSheet(memberWeeklyGoals, [member]);
    XLSX.utils.book_append_sheet(workbook, weeklySheet, '周目标');
  }

  const timestamp = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `${member.name}_目标数据_${timestamp}.xlsx`);
};
