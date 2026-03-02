// 年度目标类型
export interface AnnualGoal {
  id: string;
  year: number;
  income: number; // 年收入目标
  level: string; // 级别目标
  orderCount: number; // 单量目标
  retailVolume: number; // 零售量目标
  travelGoal: string; // 旅游目标
  createdAt: string;
  updatedAt: string;
}

// 月度目标类型
export interface MonthlyGoal {
  id: string;
  annualGoalId: string;
  year: number;
  month: number; // 1-12
  monthISO: string; // ISO8601格式: YYYY-MM
  income: number;
  level: string;
  orderCount: number;
  retailVolume: number;
  travelGoal: string;
  actualIncome?: number;
  actualLevel?: string;
  actualOrderCount?: number;
  actualRetailVolume?: number;
  actualTravelGoal?: string;
  createdAt: string;
  updatedAt: string;
}

// 周目标类型
export interface WeeklyGoal {
  id: string;
  monthlyGoalId: string;
  year: number;
  month: number;
  week: number; // ISO8601周数 1-53
  weekISO: string; // ISO8601格式: YYYY-Www
  weekStartDate: string; // 周开始日期
  weekEndDate: string; // 周结束日期
  income: number;
  level: string;
  orderCount: number;
  retailVolume: number;
  travelGoal: string;
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
