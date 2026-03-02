// 年度目标类型 - 同时支持新旧两种结构
export interface AnnualGoal {
  id: string;
  memberId?: string; // 可选，团队层面可能为空
  year: number;
  
  // 新结构：嵌套对象
  breakdownGoals?: {
    income: number;
    level: string;
    orderCount: number;
    retailVolume: number;
    travelGoal: string;
  };
  
  executionGoals?: {
    newLeads: number;
    visitCount: number;
    new5ALeads: number;
    visit5ACount: number;
    salonInviteCount: number;
    引流CardCount: number;
  };
  
  // 旧结构：扁平字段（兼容现有代码）
  income?: number;
  level?: string;
  orderCount?: number;
  retailVolume?: number;
  travelGoal?: string;
  
  // 实际完成数据 - 新结构
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
  
  // 实际完成数据 - 旧结构（兼容现有代码）
  actualIncome?: number;
  actualOrderCount?: number;
  actualRetailVolume?: number;
  
  createdAt: string;
  updatedAt: string;
}

// 月度目标类型 - 同时支持新旧两种结构
export interface MonthlyGoal {
  id: string;
  annualGoalId: string;
  year: number;
  month: number;
  monthISO: string;
  
  // 新结构
  breakdownGoals?: {
    income: number;
    level: string;
    orderCount: number;
    retailVolume: number;
    travelGoal: string;
  };
  
  executionGoals?: {
    newLeads: number;
    visitCount: number;
    new5ALeads: number;
    visit5ACount: number;
    salonInviteCount: number;
    引流CardCount: number;
  };
  
  // 旧结构（兼容现有代码）
  income?: number;
  level?: string;
  orderCount?: number;
  retailVolume?: number;
  travelGoal?: string;
  
  // 实际完成 - 新结构
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
  
  // 实际完成 - 旧结构（兼容现有代码）
  actualIncome?: number;
  actualLevel?: string;
  actualOrderCount?: number;
  actualRetailVolume?: number;
  actualTravelGoal?: string;
  
  createdAt: string;
  updatedAt: string;
}

// 周目标类型 - 同时支持新旧两种结构
export interface WeeklyGoal {
  id: string;
  monthlyGoalId: string;
  year: number;
  month: number;
  week: number;
  weekISO: string;
  weekStartDate: string;
  weekEndDate: string;
  
  // 新结构
  breakdownGoals?: {
    income: number;
    level: string;
    orderCount: number;
    retailVolume: number;
    travelGoal: string;
  };
  
  executionGoals?: {
    newLeads: number;
    visitCount: number;
    new5ALeads: number;
    visit5ACount: number;
    salonInviteCount: number;
    引流CardCount: number;
  };
  
  // 旧结构（兼容现有代码）
  income?: number;
  level?: string;
  orderCount?: number;
  retailVolume?: number;
  travelGoal?: string;
  
  // 实际完成 - 新结构
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
  
  // 实际完成 - 旧结构（兼容现有代码）
  actualIncome?: number;
  actualLevel?: string;
  actualOrderCount?: number;
  actualRetailVolume?: number;
  actualTravelGoal?: string;
  
  createdAt: string;
  updatedAt: string;
}

// 目标进度类型
export interface GoalProgress {
  annualProgress: number;
  monthlyProgress: number;
  weeklyProgress: number;
  totalAnnualGoals: number;
  completedAnnualGoals: number;
  totalMonthlyGoals: number;
  completedMonthlyGoals: number;
  totalWeeklyGoals: number;
  completedWeeklyGoals: number;
}

// 图表数据类型
export interface ChartData {
  month: string;
  target: number;
  actual: number;
  percentage: number;
}

export interface WeeklyChartData {
  week: string;
  target: number;
  actual: number;
  percentage: number;
}