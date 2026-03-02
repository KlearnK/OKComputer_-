import { useState, useEffect, useCallback } from 'react';
import type { AnnualGoal, MonthlyGoal, WeeklyGoal, GoalProgress } from '@/types/goals';

// 生成唯一ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// 存储键名
const ANNUAL_GOALS_KEY = 'annual_goals';
const MONTHLY_GOALS_KEY = 'monthly_goals';
const WEEKLY_GOALS_KEY = 'weekly_goals';

export const useGoals = () => {
  const [annualGoals, setAnnualGoals] = useState<AnnualGoal[]>([]);
  const [monthlyGoals, setMonthlyGoals] = useState<MonthlyGoal[]>([]);
  const [weeklyGoals, setWeeklyGoals] = useState<WeeklyGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 从localStorage加载数据
  useEffect(() => {
    const loadGoals = () => {
      try {
        const annualData = localStorage.getItem(ANNUAL_GOALS_KEY);
        const monthlyData = localStorage.getItem(MONTHLY_GOALS_KEY);
        const weeklyData = localStorage.getItem(WEEKLY_GOALS_KEY);

        if (annualData) setAnnualGoals(JSON.parse(annualData));
        if (monthlyData) setMonthlyGoals(JSON.parse(monthlyData));
        if (weeklyData) setWeeklyGoals(JSON.parse(weeklyData));
      } catch (error) {
        console.error('加载目标数据失败:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadGoals();
  }, []);

  // 保存年度目标
  const saveAnnualGoals = useCallback((goals: AnnualGoal[]) => {
    try {
      localStorage.setItem(ANNUAL_GOALS_KEY, JSON.stringify(goals));
      setAnnualGoals(goals);
    } catch (error) {
      console.error('保存年度目标失败:', error);
    }
  }, []);

  // 保存月度目标
  const saveMonthlyGoals = useCallback((goals: MonthlyGoal[]) => {
    try {
      localStorage.setItem(MONTHLY_GOALS_KEY, JSON.stringify(goals));
      setMonthlyGoals(goals);
    } catch (error) {
      console.error('保存月度目标失败:', error);
    }
  }, []);

  // 保存周目标
  const saveWeeklyGoals = useCallback((goals: WeeklyGoal[]) => {
    try {
      localStorage.setItem(WEEKLY_GOALS_KEY, JSON.stringify(goals));
      setWeeklyGoals(goals);
    } catch (error) {
      console.error('保存周目标失败:', error);
    }
  }, []);

  // 创建年度目标
  const createAnnualGoal = useCallback((goal: Omit<AnnualGoal, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newGoal: AnnualGoal = {
      ...goal,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updatedGoals = [...annualGoals, newGoal];
    saveAnnualGoals(updatedGoals);
    return newGoal;
  }, [annualGoals, saveAnnualGoals]);

  // 更新年度目标
  const updateAnnualGoal = useCallback((id: string, updates: Partial<AnnualGoal>) => {
    const updatedGoals = annualGoals.map(goal =>
      goal.id === id ? { ...goal, ...updates, updatedAt: new Date().toISOString() } : goal
    );
    saveAnnualGoals(updatedGoals);
  }, [annualGoals, saveAnnualGoals]);

  // 删除年度目标
  const deleteAnnualGoal = useCallback((id: string) => {
    const updatedGoals = annualGoals.filter(goal => goal.id !== id);
    saveAnnualGoals(updatedGoals);
    // 同时删除相关的月度和周目标
    const updatedMonthly = monthlyGoals.filter(goal => goal.annualGoalId !== id);
    saveMonthlyGoals(updatedMonthly);
    const updatedWeekly = weeklyGoals.filter(goal => {
      const parentMonthly = updatedMonthly.find(m => m.id === goal.monthlyGoalId);
      return parentMonthly !== undefined;
    });
    saveWeeklyGoals(updatedWeekly);
  }, [annualGoals, monthlyGoals, weeklyGoals, saveAnnualGoals, saveMonthlyGoals, saveWeeklyGoals]);

  // 创建月度目标
  const createMonthlyGoal = useCallback((goal: Omit<MonthlyGoal, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newGoal: MonthlyGoal = {
      ...goal,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updatedGoals = [...monthlyGoals, newGoal];
    saveMonthlyGoals(updatedGoals);
    return newGoal;
  }, [monthlyGoals, saveMonthlyGoals]);

  // 更新月度目标
  const updateMonthlyGoal = useCallback((id: string, updates: Partial<MonthlyGoal>) => {
    const updatedGoals = monthlyGoals.map(goal =>
      goal.id === id ? { ...goal, ...updates, updatedAt: new Date().toISOString() } : goal
    );
    saveMonthlyGoals(updatedGoals);
  }, [monthlyGoals, saveMonthlyGoals]);

  // 创建周目标
  const createWeeklyGoal = useCallback((goal: Omit<WeeklyGoal, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newGoal: WeeklyGoal = {
      ...goal,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updatedGoals = [...weeklyGoals, newGoal];
    saveWeeklyGoals(updatedGoals);
    return newGoal;
  }, [weeklyGoals, saveWeeklyGoals]);

  // 更新周目标
  const updateWeeklyGoal = useCallback((id: string, updates: Partial<WeeklyGoal>) => {
    const updatedGoals = weeklyGoals.map(goal =>
      goal.id === id ? { ...goal, ...updates, updatedAt: new Date().toISOString() } : goal
    );
    saveWeeklyGoals(updatedGoals);
  }, [weeklyGoals, saveWeeklyGoals]);

  // 获取进度统计
  const getProgress = useCallback((): GoalProgress => {
    const totalAnnual = annualGoals.length;
    const completedAnnual = annualGoals.filter(() => {
      // 判断年度目标是否完成的逻辑
      return true; // 简化处理
    }).length;

    const totalMonthly = monthlyGoals.length;
    const completedMonthly = monthlyGoals.filter(g => {
      const targetSum = g.income + g.orderCount + g.retailVolume;
      const actualSum = (g.actualIncome || 0) + (g.actualOrderCount || 0) + (g.actualRetailVolume || 0);
      return actualSum >= targetSum;
    }).length;

    const totalWeekly = weeklyGoals.length;
    const completedWeekly = weeklyGoals.filter(g => {
      const targetSum = g.income + g.orderCount + g.retailVolume;
      const actualSum = (g.actualIncome || 0) + (g.actualOrderCount || 0) + (g.actualRetailVolume || 0);
      return actualSum >= targetSum;
    }).length;

    return {
      annualProgress: totalAnnual > 0 ? (completedAnnual / totalAnnual) * 100 : 0,
      monthlyProgress: totalMonthly > 0 ? (completedMonthly / totalMonthly) * 100 : 0,
      weeklyProgress: totalWeekly > 0 ? (completedWeekly / totalWeekly) * 100 : 0,
      totalAnnualGoals: totalAnnual,
      completedAnnualGoals: completedAnnual,
      totalMonthlyGoals: totalMonthly,
      completedMonthlyGoals: completedMonthly,
      totalWeeklyGoals: totalWeekly,
      completedWeeklyGoals: completedWeekly,
    };
  }, [annualGoals, monthlyGoals, weeklyGoals]);

  return {
    annualGoals,
    monthlyGoals,
    weeklyGoals,
    isLoading,
    createAnnualGoal,
    updateAnnualGoal,
    deleteAnnualGoal,
    createMonthlyGoal,
    updateMonthlyGoal,
    createWeeklyGoal,
    updateWeeklyGoal,
    getProgress,
  };
};
