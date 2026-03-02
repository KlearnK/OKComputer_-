// 团队成员类型
export interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
  department?: string;
  email?: string;
  phone: string;
  wechat?: string;
  joinDate: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

// 团队成员的年度目标类型（包含拆解类和执行类）
export interface TeamMemberAnnualGoal {
  id: string;
  memberId: string;
  year: number;
  
  // 拆解类目标
  breakdownGoals: {
    income: number; // 年收入目标
    level: string; // 级别目标
    orderCount: number; // 单量目标
    retailVolume: number; // 零售量目标
    travelGoal: string; // 旅游目标
  };
  
  // 执行类目标
  executionGoals: {
    newLeads: number; // 新增名单
    visitCount: number; // 拜访名单人次
    new5ALeads: number; // 新增5A名单
    visit5ACount: number; // 拜访5A人次
    salonInviteCount: number; // 邀约沙龙/会所人次
   引流CardCount: number; // 引流卡量
  };
  
  // 非量化指标目标
  qualitativeGoals: {
    learningGoal: string; // 学习目标
    healthGoal: string; // 健康目标
    relationshipGoal: string; // 关系目标
    hobbyGoal: string; // 爱好目标
  };
  
  // 实际完成数据（从周目标自动聚合）
  actualBreakdown?: {
    income?: number;
    orderCount?: number;
    retailVolume?: number;
  };
  
  actualExecution?: {
    newLeads?: number;
    visitCount?: number;
    new5ALeads?: number;
    visit5ACount?: number;
    salonInviteCount?: number;
    引流CardCount?: number;
  };
  
  createdAt: string;
  updatedAt: string;
}

// 团队成员的月度目标类型
export interface TeamMemberMonthlyGoal {
  id: string;
  memberId: string;
  annualGoalId: string;
  year: number;
  month: number;
  monthISO: string; // ISO8601格式: YYYY-MM
  
  // 拆解类目标
  breakdownGoals: {
    income: number;
    level: string;
    orderCount: number;
    retailVolume: number;
    travelGoal: string;
  };
  
  // 执行类目标
  executionGoals: {
    newLeads: number;
    visitCount: number;
    new5ALeads: number;
    visit5ACount: number;
    salonInviteCount: number;
    引流CardCount: number;
  };
  
  // 实际完成数据
  actualBreakdown?: {
    income?: number;
    level?: string;
    orderCount?: number;
    retailVolume?: number;
    travelGoal?: string;
  };
  
  actualExecution?: {
    newLeads?: number;
    visitCount?: number;
    new5ALeads?: number;
    visit5ACount?: number;
    salonInviteCount?: number;
    引流CardCount?: number;
  };
  
  createdAt: string;
  updatedAt: string;
}

// 团队成员的周目标类型
export interface TeamMemberWeeklyGoal {
  id: string;
  memberId: string;
  monthlyGoalId: string;
  year: number;
  month: number;
  week: number;
  weekISO: string; // ISO8601格式: YYYY-Www
  weekStartDate: string;
  weekEndDate: string;
  
  // 拆解类目标
  breakdownGoals: {
    income: number;
    level: string;
    orderCount: number;
    retailVolume: number;
    travelGoal: string;
  };
  
  // 执行类目标
  executionGoals: {
    newLeads: number;
    visitCount: number;
    new5ALeads: number;
    visit5ACount: number;
    salonInviteCount: number;
    引流CardCount: number;
  };
  
  // 实际完成数据
  actualBreakdown?: {
    income?: number;
    level?: string;
    orderCount?: number;
    retailVolume?: number;
    travelGoal?: string;
  };
  
  actualExecution?: {
    newLeads?: number;
    visitCount?: number;
    new5ALeads?: number;
    visit5ACount?: number;
    salonInviteCount?: number;
    引流CardCount?: number;
  };
  
  createdAt: string;
  updatedAt: string;
}

// 团队统计数据
export interface TeamStats {
  totalMembers: number;
  activeMembers: number;
  totalAnnualGoals: number;
  totalMonthlyGoals: number;
  totalWeeklyGoals: number;
  avgBreakdownProgress: number; // 年度拆解进度
  avgExecutionProgress: number; // 年度执行进度
  avgMonthlyBreakdownProgress: number; // 月度拆解进度
  avgMonthlyExecutionProgress: number; // 月度执行进度
  topPerformers: Array<{
    memberId: string;
    memberName: string;
    breakdownProgress: number;
    executionProgress: number;
  }>;
}

// 团队成员进度
export interface MemberProgress {
  memberId: string;
  memberName: string;
  annualBreakdownProgress: number;
  annualExecutionProgress: number;
  monthlyBreakdownProgress: number;
  monthlyExecutionProgress: number;
  weeklyBreakdownProgress: number;
  weeklyExecutionProgress: number;
  totalAnnualGoals: number;
  completedAnnualGoals: number;
  totalMonthlyGoals: number;
  completedMonthlyGoals: number;
  totalWeeklyGoals: number;
  completedWeeklyGoals: number;
}
