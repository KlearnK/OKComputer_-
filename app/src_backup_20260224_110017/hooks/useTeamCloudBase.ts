import { useState, useEffect, useCallback, useRef } from 'react';
import type { 
  TeamMember, 
  TeamMemberAnnualGoal, 
  TeamMemberMonthlyGoal, 
  TeamMemberWeeklyGoal,
  TeamStats,
  MemberProgress
} from '@/types/team';
import { 
  memberDB, 
  annualGoalDB, 
  monthlyGoalDB, 
  weeklyGoalDB
} from '@/cloudbase/database';
import { 
  getCurrentTeamCode, 
  setTeamCode, 
  createNewTeam,
  generateShareLink 
} from '@/cloudbase/teamCode';
import { anonymousAuth } from '@/cloudbase/config';
import type cloudbase from '@cloudbase/js-sdk';

// 本地存储备份键名（用于离线支持）
const OFFLINE_MEMBERS_KEY = 'offline_members';
const OFFLINE_ANNUAL_GOALS_KEY = 'offline_annual_goals';
const OFFLINE_MONTHLY_GOALS_KEY = 'offline_monthly_goals';
const OFFLINE_WEEKLY_GOALS_KEY = 'offline_weekly_goals';
const OFFLINE_QUEUE_KEY = 'offline_queue';

// 离线操作队列类型
interface OfflineOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  collection: 'members' | 'annual_goals' | 'monthly_goals' | 'weekly_goals';
  data?: any;
  timestamp: number;
}

export const useTeamCloudBase = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [annualGoals, setAnnualGoals] = useState<TeamMemberAnnualGoal[]>([]);
  const [monthlyGoals, setMonthlyGoals] = useState<TeamMemberMonthlyGoal[]>([]);
  const [weeklyGoals, setWeeklyGoals] = useState<TeamMemberWeeklyGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [teamCode, setTeamCodeState] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  
  // 使用 ref 存储监听器
  const listenersRef = useRef<cloudbase.database.DBRealtimeListener[]>([]);
  const teamCodeRef = useRef<string | null>(null);

  // 更新 teamCode ref
  useEffect(() => {
    teamCodeRef.current = teamCode;
  }, [teamCode]);

  // 监听网络状态
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // 网络恢复时同步离线数据
      syncOfflineData();
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 初始化团队码
  useEffect(() => {
    const initTeam = async () => {
      let code = getCurrentTeamCode();
      
      // 如果没有团队码，创建新团队
      if (!code) {
        code = createNewTeam();
      }
      
      setTeamCodeState(code);
      
      // 匿名登录
      try {
        await anonymousAuth();
      } catch (error) {
        console.error('匿名登录失败:', error);
      }
    };

    initTeam();
  }, []);

  // 加载数据并设置实时监听
  useEffect(() => {
    if (!teamCode) return;

    // 先尝试从本地缓存加载（离线支持）
    loadFromLocalStorage();

    // 然后加载云端数据
    loadCloudData();

    // 设置实时监听
    setupRealtimeListeners();

    return () => {
      // 清理监听器
      listenersRef.current.forEach(listener => listener.close());
      listenersRef.current = [];
    };
  }, [teamCode]);

  // 从本地存储加载数据（离线支持）
  const loadFromLocalStorage = () => {
    if (!teamCode) return;
    
    try {
      const membersData = localStorage.getItem(`${OFFLINE_MEMBERS_KEY}_${teamCode}`);
      const annualData = localStorage.getItem(`${OFFLINE_ANNUAL_GOALS_KEY}_${teamCode}`);
      const monthlyData = localStorage.getItem(`${OFFLINE_MONTHLY_GOALS_KEY}_${teamCode}`);
      const weeklyData = localStorage.getItem(`${OFFLINE_WEEKLY_GOALS_KEY}_${teamCode}`);

      if (membersData) setMembers(JSON.parse(membersData));
      if (annualData) setAnnualGoals(JSON.parse(annualData));
      if (monthlyData) setMonthlyGoals(JSON.parse(monthlyData));
      if (weeklyData) setWeeklyGoals(JSON.parse(weeklyData));
    } catch (error) {
      console.error('从本地存储加载数据失败:', error);
    }
  };

  // 保存数据到本地存储（离线支持）
  const saveToLocalStorage = useCallback((
    newMembers: TeamMember[],
    newAnnualGoals: TeamMemberAnnualGoal[],
    newMonthlyGoals: TeamMemberMonthlyGoal[],
    newWeeklyGoals: TeamMemberWeeklyGoal[]
  ) => {
    if (!teamCodeRef.current) return;
    
    try {
      localStorage.setItem(`${OFFLINE_MEMBERS_KEY}_${teamCodeRef.current}`, JSON.stringify(newMembers));
      localStorage.setItem(`${OFFLINE_ANNUAL_GOALS_KEY}_${teamCodeRef.current}`, JSON.stringify(newAnnualGoals));
      localStorage.setItem(`${OFFLINE_MONTHLY_GOALS_KEY}_${teamCodeRef.current}`, JSON.stringify(newMonthlyGoals));
      localStorage.setItem(`${OFFLINE_WEEKLY_GOALS_KEY}_${teamCodeRef.current}`, JSON.stringify(newWeeklyGoals));
    } catch (error) {
      console.error('保存到本地存储失败:', error);
    }
  }, []);

  // 加载云端数据
  const loadCloudData = async () => {
    if (!teamCode) return;

    setIsLoading(true);
    setSyncStatus('syncing');

    try {
      // 并行加载所有数据
      const [membersData, annualData, monthlyData, weeklyData] = await Promise.all([
        memberDB.getAll(teamCode),
        annualGoalDB.getAll(teamCode),
        monthlyGoalDB.getAll(teamCode),
        weeklyGoalDB.getAll(teamCode),
      ]);

      // 过滤掉初始化占位文档
      const filterInitDoc = (doc: any) => !doc._init;

      setMembers(membersData.filter(filterInitDoc));
      setAnnualGoals(annualData.filter(filterInitDoc));
      setMonthlyGoals(monthlyData.filter(filterInitDoc));
      setWeeklyGoals(weeklyData.filter(filterInitDoc));

      // 保存到本地存储
      saveToLocalStorage(
        membersData.filter(filterInitDoc),
        annualData.filter(filterInitDoc),
        monthlyData.filter(filterInitDoc),
        weeklyData.filter(filterInitDoc)
      );

      setSyncStatus('synced');
    } catch (error) {
      console.error('加载云端数据失败:', error);
      setSyncStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  // 设置实时监听器
  const setupRealtimeListeners = () => {
    if (!teamCode) return;

    // 清理旧监听器
    listenersRef.current.forEach(listener => listener.close());
    listenersRef.current = [];

    // 监听成员变化
    const memberListener = memberDB.onSnapshot(teamCode, (newMembers) => {
      const filtered = newMembers.filter((doc: any) => !doc._init);
      setMembers(filtered);
      saveToLocalStorage(filtered, annualGoals, monthlyGoals, weeklyGoals);
    });
    listenersRef.current.push(memberListener);

    // 监听年度目标变化
    const annualListener = annualGoalDB.onSnapshot(teamCode, (newGoals) => {
      const filtered = newGoals.filter((doc: any) => !doc._init);
      setAnnualGoals(filtered);
      saveToLocalStorage(members, filtered, monthlyGoals, weeklyGoals);
    });
    listenersRef.current.push(annualListener);

    // 监听月度目标变化
    const monthlyListener = monthlyGoalDB.onSnapshot(teamCode, (newGoals) => {
      const filtered = newGoals.filter((doc: any) => !doc._init);
      setMonthlyGoals(filtered);
      saveToLocalStorage(members, annualGoals, filtered, weeklyGoals);
    });
    listenersRef.current.push(monthlyListener);

    // 监听周目标变化
    const weeklyListener = weeklyGoalDB.onSnapshot(teamCode, (newGoals) => {
      const filtered = newGoals.filter((doc: any) => !doc._init);
      setWeeklyGoals(filtered);
      saveToLocalStorage(members, annualGoals, monthlyGoals, filtered);
    });
    listenersRef.current.push(weeklyListener);
  };

  // 同步离线数据
  const syncOfflineData = async () => {
    if (!teamCode) return;

    try {
      const queueStr = localStorage.getItem(`${OFFLINE_QUEUE_KEY}_${teamCode}`);
      if (!queueStr) return;

      const queue: OfflineOperation[] = JSON.parse(queueStr);
      if (queue.length === 0) return;

      setSyncStatus('syncing');

      // 按顺序执行离线操作
      for (const op of queue) {
        try {
          switch (op.collection) {
            case 'members':
              if (op.type === 'create' && op.data) {
                await memberDB.create(teamCode, op.data);
              } else if (op.type === 'update' && op.data) {
                await memberDB.update(teamCode, op.id, op.data);
              } else if (op.type === 'delete') {
                await memberDB.delete(teamCode, op.id);
              }
              break;
            case 'annual_goals':
              if (op.type === 'create' && op.data) {
                await annualGoalDB.create(teamCode, op.data);
              } else if (op.type === 'update' && op.data) {
                await annualGoalDB.update(teamCode, op.id, op.data);
              } else if (op.type === 'delete') {
                await annualGoalDB.delete(teamCode, op.id);
              }
              break;
            case 'monthly_goals':
              if (op.type === 'create' && op.data) {
                await monthlyGoalDB.create(teamCode, op.data);
              } else if (op.type === 'update' && op.data) {
                await monthlyGoalDB.update(teamCode, op.id, op.data);
              } else if (op.type === 'delete') {
                await monthlyGoalDB.delete(teamCode, op.id);
              }
              break;
            case 'weekly_goals':
              if (op.type === 'create' && op.data) {
                await weeklyGoalDB.create(teamCode, op.data);
              } else if (op.type === 'update' && op.data) {
                await weeklyGoalDB.update(teamCode, op.id, op.data);
              } else if (op.type === 'delete') {
                await weeklyGoalDB.delete(teamCode, op.id);
              }
              break;
          }
        } catch (error) {
          console.error(`同步离线操作失败:`, op, error);
        }
      }

      // 清空队列
      localStorage.removeItem(`${OFFLINE_QUEUE_KEY}_${teamCode}`);
      setSyncStatus('synced');

      // 重新加载数据
      await loadCloudData();
    } catch (error) {
      console.error('同步离线数据失败:', error);
      setSyncStatus('error');
    }
  };

  // 添加到离线队列
  const addToOfflineQueue = (operation: Omit<OfflineOperation, 'timestamp'>) => {
    if (!teamCode) return;

    try {
      const queueStr = localStorage.getItem(`${OFFLINE_QUEUE_KEY}_${teamCode}`);
      const queue: OfflineOperation[] = queueStr ? JSON.parse(queueStr) : [];
      
      queue.push({
        ...operation,
        timestamp: Date.now(),
      });
      
      localStorage.setItem(`${OFFLINE_QUEUE_KEY}_${teamCode}`, JSON.stringify(queue));
    } catch (error) {
      console.error('添加到离线队列失败:', error);
    }
  };

  // 团队成员管理
  const createMember = useCallback(async (member: Omit<TeamMember, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!teamCode) return null;

    // 乐观更新
    const newMember: TeamMember = {
      ...member,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const updatedMembers = [...members, newMember];
    setMembers(updatedMembers);
    saveToLocalStorage(updatedMembers, annualGoals, monthlyGoals, weeklyGoals);

    if (isOnline) {
      try {
        await memberDB.create(teamCode, member);
      } catch (error) {
        console.error('创建成员失败:', error);
        // 添加到离线队列
        addToOfflineQueue({
          id: newMember.id,
          type: 'create',
          collection: 'members',
          data: member,
        });
      }
    } else {
      addToOfflineQueue({
        id: newMember.id,
        type: 'create',
        collection: 'members',
        data: member,
      });
    }

    return newMember;
  }, [teamCode, members, annualGoals, monthlyGoals, weeklyGoals, isOnline, saveToLocalStorage]);

  const updateMember = useCallback(async (id: string, updates: Partial<TeamMember>) => {
    if (!teamCode) return;

    // 乐观更新
    const updated = members.map(m => 
      m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m
    );
    setMembers(updated);
    saveToLocalStorage(updated, annualGoals, monthlyGoals, weeklyGoals);

    if (isOnline) {
      try {
        await memberDB.update(teamCode, id, updates);
      } catch (error) {
        console.error('更新成员失败:', error);
        addToOfflineQueue({
          id,
          type: 'update',
          collection: 'members',
          data: updates,
        });
      }
    } else {
      addToOfflineQueue({
        id,
        type: 'update',
        collection: 'members',
        data: updates,
      });
    }
  }, [teamCode, members, annualGoals, monthlyGoals, weeklyGoals, isOnline, saveToLocalStorage]);

  const deleteMember = useCallback(async (id: string) => {
    if (!teamCode) return;

    // 乐观更新
    const updatedMembers = members.filter(m => m.id !== id);
    setMembers(updatedMembers);

    // 删除相关的目标
    const updatedAnnual = annualGoals.filter(g => g.memberId !== id);
    setAnnualGoals(updatedAnnual);

    const updatedMonthly = monthlyGoals.filter(g => g.memberId !== id);
    setMonthlyGoals(updatedMonthly);

    const updatedWeekly = weeklyGoals.filter(g => g.memberId !== id);
    setWeeklyGoals(updatedWeekly);

    saveToLocalStorage(updatedMembers, updatedAnnual, updatedMonthly, updatedWeekly);

    if (isOnline) {
      try {
        await memberDB.delete(teamCode, id);
        // 同时删除相关目标
        for (const goal of annualGoals.filter(g => g.memberId === id)) {
          await annualGoalDB.delete(teamCode, goal.id);
        }
        for (const goal of monthlyGoals.filter(g => g.memberId === id)) {
          await monthlyGoalDB.delete(teamCode, goal.id);
        }
        for (const goal of weeklyGoals.filter(g => g.memberId === id)) {
          await weeklyGoalDB.delete(teamCode, goal.id);
        }
      } catch (error) {
        console.error('删除成员失败:', error);
        addToOfflineQueue({
          id,
          type: 'delete',
          collection: 'members',
        });
      }
    } else {
      addToOfflineQueue({
        id,
        type: 'delete',
        collection: 'members',
      });
    }
  }, [teamCode, members, annualGoals, monthlyGoals, weeklyGoals, isOnline, saveToLocalStorage]);

  // 年度目标管理
  const createAnnualGoal = useCallback(async (goal: Omit<TeamMemberAnnualGoal, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!teamCode) return null;

    const newGoal: TeamMemberAnnualGoal = {
      ...goal,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [...annualGoals, newGoal];
    setAnnualGoals(updated);
    saveToLocalStorage(members, updated, monthlyGoals, weeklyGoals);

    if (isOnline) {
      try {
        await annualGoalDB.create(teamCode, goal);
      } catch (error) {
        console.error('创建年度目标失败:', error);
        addToOfflineQueue({
          id: newGoal.id,
          type: 'create',
          collection: 'annual_goals',
          data: goal,
        });
      }
    } else {
      addToOfflineQueue({
        id: newGoal.id,
        type: 'create',
        collection: 'annual_goals',
        data: goal,
      });
    }

    return newGoal;
  }, [teamCode, members, annualGoals, monthlyGoals, weeklyGoals, isOnline, saveToLocalStorage]);

  const updateAnnualGoal = useCallback(async (id: string, updates: Partial<TeamMemberAnnualGoal>) => {
    if (!teamCode) return;

    const updated = annualGoals.map(g => 
      g.id === id ? { ...g, ...updates, updatedAt: new Date().toISOString() } : g
    );
    setAnnualGoals(updated);
    saveToLocalStorage(members, updated, monthlyGoals, weeklyGoals);

    if (isOnline) {
      try {
        await annualGoalDB.update(teamCode, id, updates);
      } catch (error) {
        console.error('更新年度目标失败:', error);
        addToOfflineQueue({
          id,
          type: 'update',
          collection: 'annual_goals',
          data: updates,
        });
      }
    } else {
      addToOfflineQueue({
        id,
        type: 'update',
        collection: 'annual_goals',
        data: updates,
      });
    }
  }, [teamCode, members, annualGoals, monthlyGoals, weeklyGoals, isOnline, saveToLocalStorage]);

  const updateAnnualGoalActual = useCallback(async (
    id: string, 
    actualBreakdown: Partial<TeamMemberAnnualGoal['breakdownGoals']>, 
    actualExecution: Partial<TeamMemberAnnualGoal['executionGoals']>
  ) => {
    if (!teamCode) return;

    const updated = annualGoals.map(g => 
      g.id === id ? { 
        ...g, 
        actualBreakdown: { ...g.actualBreakdown, ...actualBreakdown },
        actualExecution: { ...g.actualExecution, ...actualExecution },
        updatedAt: new Date().toISOString() 
      } : g
    );
    setAnnualGoals(updated);
    saveToLocalStorage(members, updated, monthlyGoals, weeklyGoals);

    if (isOnline) {
      try {
        await annualGoalDB.updateActual(teamCode, id, actualBreakdown, actualExecution);
      } catch (error) {
        console.error('更新年度目标实际完成失败:', error);
        addToOfflineQueue({
          id,
          type: 'update',
          collection: 'annual_goals',
          data: { actualBreakdown, actualExecution },
        });
      }
    } else {
      addToOfflineQueue({
        id,
        type: 'update',
        collection: 'annual_goals',
        data: { actualBreakdown, actualExecution },
      });
    }
  }, [teamCode, members, annualGoals, monthlyGoals, weeklyGoals, isOnline, saveToLocalStorage]);

  const deleteAnnualGoal = useCallback(async (id: string) => {
    if (!teamCode) return;

    const updatedAnnual = annualGoals.filter(g => g.id !== id);
    setAnnualGoals(updatedAnnual);

    // 删除相关的月度目标
    const updatedMonthly = monthlyGoals.filter(g => g.annualGoalId !== id);
    setMonthlyGoals(updatedMonthly);

    // 删除相关的周目标
    const monthlyGoalIds = monthlyGoals.filter(g => g.annualGoalId === id).map(g => g.id);
    const updatedWeekly = weeklyGoals.filter(g => !monthlyGoalIds.includes(g.monthlyGoalId));
    setWeeklyGoals(updatedWeekly);

    saveToLocalStorage(members, updatedAnnual, updatedMonthly, updatedWeekly);

    if (isOnline) {
      try {
        await annualGoalDB.delete(teamCode, id);
      } catch (error) {
        console.error('删除年度目标失败:', error);
        addToOfflineQueue({
          id,
          type: 'delete',
          collection: 'annual_goals',
        });
      }
    } else {
      addToOfflineQueue({
        id,
        type: 'delete',
        collection: 'annual_goals',
      });
    }
  }, [teamCode, members, annualGoals, monthlyGoals, weeklyGoals, isOnline, saveToLocalStorage]);

  // 月度目标管理
  const createMonthlyGoal = useCallback(async (goal: Omit<TeamMemberMonthlyGoal, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!teamCode) return null;

    const newGoal: TeamMemberMonthlyGoal = {
      ...goal,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [...monthlyGoals, newGoal];
    setMonthlyGoals(updated);
    saveToLocalStorage(members, annualGoals, updated, weeklyGoals);

    if (isOnline) {
      try {
        await monthlyGoalDB.create(teamCode, goal);
      } catch (error) {
        console.error('创建月度目标失败:', error);
        addToOfflineQueue({
          id: newGoal.id,
          type: 'create',
          collection: 'monthly_goals',
          data: goal,
        });
      }
    } else {
      addToOfflineQueue({
        id: newGoal.id,
        type: 'create',
        collection: 'monthly_goals',
        data: goal,
      });
    }

    return newGoal;
  }, [teamCode, members, annualGoals, monthlyGoals, weeklyGoals, isOnline, saveToLocalStorage]);

  const updateMonthlyGoal = useCallback(async (id: string, updates: Partial<TeamMemberMonthlyGoal>) => {
    if (!teamCode) return;

    const updated = monthlyGoals.map(g => 
      g.id === id ? { ...g, ...updates, updatedAt: new Date().toISOString() } : g
    );
    setMonthlyGoals(updated);
    saveToLocalStorage(members, annualGoals, updated, weeklyGoals);

    if (isOnline) {
      try {
        await monthlyGoalDB.update(teamCode, id, updates);
      } catch (error) {
        console.error('更新月度目标失败:', error);
        addToOfflineQueue({
          id,
          type: 'update',
          collection: 'monthly_goals',
          data: updates,
        });
      }
    } else {
      addToOfflineQueue({
        id,
        type: 'update',
        collection: 'monthly_goals',
        data: updates,
      });
    }
  }, [teamCode, members, annualGoals, monthlyGoals, weeklyGoals, isOnline, saveToLocalStorage]);

  const updateMonthlyGoalActual = useCallback(async (
    id: string, 
    actualBreakdown: Partial<TeamMemberMonthlyGoal['breakdownGoals']>, 
    actualExecution: Partial<TeamMemberMonthlyGoal['executionGoals']>
  ) => {
    if (!teamCode) return;

    const updated = monthlyGoals.map(g => 
      g.id === id ? { 
        ...g, 
        actualBreakdown: { ...g.actualBreakdown, ...actualBreakdown },
        actualExecution: { ...g.actualExecution, ...actualExecution },
        updatedAt: new Date().toISOString() 
      } : g
    );
    setMonthlyGoals(updated);
    saveToLocalStorage(members, annualGoals, updated, weeklyGoals);

    if (isOnline) {
      try {
        await monthlyGoalDB.updateActual(teamCode, id, actualBreakdown, actualExecution);
      } catch (error) {
        console.error('更新月度目标实际完成失败:', error);
        addToOfflineQueue({
          id,
          type: 'update',
          collection: 'monthly_goals',
          data: { actualBreakdown, actualExecution },
        });
      }
    } else {
      addToOfflineQueue({
        id,
        type: 'update',
        collection: 'monthly_goals',
        data: { actualBreakdown, actualExecution },
      });
    }
  }, [teamCode, members, annualGoals, monthlyGoals, weeklyGoals, isOnline, saveToLocalStorage]);

  const deleteMonthlyGoal = useCallback(async (id: string) => {
    if (!teamCode) return;

    const updatedMonthly = monthlyGoals.filter(g => g.id !== id);
    setMonthlyGoals(updatedMonthly);

    // 删除关联的周目标
    const updatedWeekly = weeklyGoals.filter(g => g.monthlyGoalId !== id);
    setWeeklyGoals(updatedWeekly);

    saveToLocalStorage(members, annualGoals, updatedMonthly, updatedWeekly);

    if (isOnline) {
      try {
        await monthlyGoalDB.delete(teamCode, id);
      } catch (error) {
        console.error('删除月度目标失败:', error);
        addToOfflineQueue({
          id,
          type: 'delete',
          collection: 'monthly_goals',
        });
      }
    } else {
      addToOfflineQueue({
        id,
        type: 'delete',
        collection: 'monthly_goals',
      });
    }
  }, [teamCode, members, annualGoals, monthlyGoals, weeklyGoals, isOnline, saveToLocalStorage]);

  // 周目标管理
  const createWeeklyGoal = useCallback(async (goal: Omit<TeamMemberWeeklyGoal, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!teamCode) return null;

    const newGoal: TeamMemberWeeklyGoal = {
      ...goal,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [...weeklyGoals, newGoal];
    setWeeklyGoals(updated);
    saveToLocalStorage(members, annualGoals, monthlyGoals, updated);

    if (isOnline) {
      try {
        await weeklyGoalDB.create(teamCode, goal);
      } catch (error) {
        console.error('创建周目标失败:', error);
        addToOfflineQueue({
          id: newGoal.id,
          type: 'create',
          collection: 'weekly_goals',
          data: goal,
        });
      }
    } else {
      addToOfflineQueue({
        id: newGoal.id,
        type: 'create',
        collection: 'weekly_goals',
        data: goal,
      });
    }

    return newGoal;
  }, [teamCode, members, annualGoals, monthlyGoals, weeklyGoals, isOnline, saveToLocalStorage]);

  const updateWeeklyGoal = useCallback(async (id: string, updates: Partial<TeamMemberWeeklyGoal>) => {
    if (!teamCode) return;

    const updated = weeklyGoals.map(g => 
      g.id === id ? { ...g, ...updates, updatedAt: new Date().toISOString() } : g
    );
    setWeeklyGoals(updated);
    saveToLocalStorage(members, annualGoals, monthlyGoals, updated);

    if (isOnline) {
      try {
        await weeklyGoalDB.update(teamCode, id, updates);
      } catch (error) {
        console.error('更新周目标失败:', error);
        addToOfflineQueue({
          id,
          type: 'update',
          collection: 'weekly_goals',
          data: updates,
        });
      }
    } else {
      addToOfflineQueue({
        id,
        type: 'update',
        collection: 'weekly_goals',
        data: updates,
      });
    }
  }, [teamCode, members, annualGoals, monthlyGoals, weeklyGoals, isOnline, saveToLocalStorage]);

  const updateWeeklyGoalActual = useCallback(async (
    id: string, 
    actualBreakdown: Partial<TeamMemberWeeklyGoal['breakdownGoals']>, 
    actualExecution: Partial<TeamMemberWeeklyGoal['executionGoals']>
  ) => {
    if (!teamCode) return;

    const updated = weeklyGoals.map(g => 
      g.id === id ? { 
        ...g, 
        actualBreakdown: { ...g.actualBreakdown, ...actualBreakdown },
        actualExecution: { ...g.actualExecution, ...actualExecution },
        updatedAt: new Date().toISOString() 
      } : g
    );
    setWeeklyGoals(updated);
    saveToLocalStorage(members, annualGoals, monthlyGoals, updated);

    if (isOnline) {
      try {
        await weeklyGoalDB.updateActual(teamCode, id, actualBreakdown, actualExecution);
      } catch (error) {
        console.error('更新周目标实际完成失败:', error);
        addToOfflineQueue({
          id,
          type: 'update',
          collection: 'weekly_goals',
          data: { actualBreakdown, actualExecution },
        });
      }
    } else {
      addToOfflineQueue({
        id,
        type: 'update',
        collection: 'weekly_goals',
        data: { actualBreakdown, actualExecution },
      });
    }
  }, [teamCode, members, annualGoals, monthlyGoals, weeklyGoals, isOnline, saveToLocalStorage]);

  const deleteWeeklyGoal = useCallback(async (id: string) => {
    if (!teamCode) return;

    const updatedWeekly = weeklyGoals.filter(g => g.id !== id);
    setWeeklyGoals(updatedWeekly);
    saveToLocalStorage(members, annualGoals, monthlyGoals, updatedWeekly);

    if (isOnline) {
      try {
        await weeklyGoalDB.delete(teamCode, id);
      } catch (error) {
        console.error('删除周目标失败:', error);
        addToOfflineQueue({
          id,
          type: 'delete',
          collection: 'weekly_goals',
        });
      }
    } else {
      addToOfflineQueue({
        id,
        type: 'delete',
        collection: 'weekly_goals',
      });
    }
  }, [teamCode, members, annualGoals, monthlyGoals, weeklyGoals, isOnline, saveToLocalStorage]);

  // 计算目标完成进度
  const calculateBreakdownProgress = (goals: Array<{ breakdownGoals: { income: number; orderCount: number; retailVolume: number }; actualBreakdown?: { income?: number; orderCount?: number; retailVolume?: number } }>) => {
    if (goals.length === 0) return 0;
    let totalProgress = 0;
    goals.forEach(g => {
      const target = g.breakdownGoals.income + g.breakdownGoals.orderCount + g.breakdownGoals.retailVolume;
      const actual = (g.actualBreakdown?.income || 0) + (g.actualBreakdown?.orderCount || 0) + (g.actualBreakdown?.retailVolume || 0);
      totalProgress += target > 0 ? Math.min((actual / target) * 100, 100) : 0;
    });
    return totalProgress / goals.length;
  };

  const calculateExecutionProgress = (goals: Array<{ executionGoals: { newLeads: number; visitCount: number; new5ALeads: number; visit5ACount: number; salonInviteCount: number; 引流CardCount: number }; actualExecution?: { newLeads?: number; visitCount?: number; new5ALeads?: number; visit5ACount?: number; salonInviteCount?: number; 引流CardCount?: number } }>) => {
    if (goals.length === 0) return 0;
    let totalProgress = 0;
    goals.forEach(g => {
      const target = g.executionGoals.newLeads + g.executionGoals.visitCount + g.executionGoals.new5ALeads + 
                     g.executionGoals.visit5ACount + g.executionGoals.salonInviteCount + g.executionGoals.引流CardCount;
      const actual = (g.actualExecution?.newLeads || 0) + (g.actualExecution?.visitCount || 0) + 
                     (g.actualExecution?.new5ALeads || 0) + (g.actualExecution?.visit5ACount || 0) +
                     (g.actualExecution?.salonInviteCount || 0) + (g.actualExecution?.引流CardCount || 0);
      totalProgress += target > 0 ? Math.min((actual / target) * 100, 100) : 0;
    });
    return totalProgress / goals.length;
  };

  // 获取团队成员的进度
  const getMemberProgress = useCallback((memberId: string): MemberProgress => {
    const memberAnnualGoals = annualGoals.filter(g => g.memberId === memberId);
    const memberMonthlyGoals = monthlyGoals.filter(g => g.memberId === memberId);
    const memberWeeklyGoals = weeklyGoals.filter(g => g.memberId === memberId);

    const annualBreakdownProgress = calculateBreakdownProgress(memberAnnualGoals);
    const annualExecutionProgress = calculateExecutionProgress(memberAnnualGoals);

    const monthlyBreakdownProgress = calculateBreakdownProgress(memberMonthlyGoals);
    const monthlyExecutionProgress = calculateExecutionProgress(memberMonthlyGoals);

    const weeklyBreakdownProgress = calculateBreakdownProgress(memberWeeklyGoals);
    const weeklyExecutionProgress = calculateExecutionProgress(memberWeeklyGoals);

    const completedAnnual = memberAnnualGoals.filter(g => {
      const target = g.breakdownGoals.income + g.breakdownGoals.orderCount + g.breakdownGoals.retailVolume;
      const actual = (g.actualBreakdown?.income || 0) + (g.actualBreakdown?.orderCount || 0) + (g.actualBreakdown?.retailVolume || 0);
      return actual >= target && target > 0;
    }).length;

    const completedMonthly = memberMonthlyGoals.filter(g => {
      const target = g.breakdownGoals.income + g.breakdownGoals.orderCount + g.breakdownGoals.retailVolume;
      const actual = (g.actualBreakdown?.income || 0) + (g.actualBreakdown?.orderCount || 0) + (g.actualBreakdown?.retailVolume || 0);
      return actual >= target && target > 0;
    }).length;

    const completedWeekly = memberWeeklyGoals.filter(g => {
      const target = g.breakdownGoals.income + g.breakdownGoals.orderCount + g.breakdownGoals.retailVolume;
      const actual = (g.actualBreakdown?.income || 0) + (g.actualBreakdown?.orderCount || 0) + (g.actualBreakdown?.retailVolume || 0);
      return actual >= target && target > 0;
    }).length;

    return {
      memberId,
      memberName: members.find(m => m.id === memberId)?.name || 'Unknown',
      annualBreakdownProgress,
      annualExecutionProgress,
      monthlyBreakdownProgress,
      monthlyExecutionProgress,
      weeklyBreakdownProgress,
      weeklyExecutionProgress,
      totalAnnualGoals: memberAnnualGoals.length,
      completedAnnualGoals: completedAnnual,
      totalMonthlyGoals: memberMonthlyGoals.length,
      completedMonthlyGoals: completedMonthly,
      totalWeeklyGoals: memberWeeklyGoals.length,
      completedWeeklyGoals: completedWeekly,
    };
  }, [annualGoals, monthlyGoals, weeklyGoals, members]);

  // 获取团队统计数据
  const getTeamStats = useCallback((): TeamStats => {
    const activeMembers = members.filter(m => m.status === 'active');
    
    let totalAnnualBreakdownProgress = 0;
    let totalAnnualExecutionProgress = 0;
    let totalMonthlyBreakdownProgress = 0;
    let totalMonthlyExecutionProgress = 0;
    
    activeMembers.forEach(member => {
      const progress = getMemberProgress(member.id);
      totalAnnualBreakdownProgress += progress.annualBreakdownProgress;
      totalAnnualExecutionProgress += progress.annualExecutionProgress;
      totalMonthlyBreakdownProgress += progress.monthlyBreakdownProgress;
      totalMonthlyExecutionProgress += progress.monthlyExecutionProgress;
    });

    const memberCount = activeMembers.length || 1;
    
    const topPerformers = activeMembers
      .map(member => {
        const progress = getMemberProgress(member.id);
        return {
          memberId: member.id,
          memberName: member.name,
          breakdownProgress: progress.annualBreakdownProgress,
          executionProgress: progress.annualExecutionProgress,
        };
      })
      .sort((a, b) => b.breakdownProgress - a.breakdownProgress)
      .slice(0, 3);

    return {
      totalMembers: members.length,
      activeMembers: activeMembers.length,
      totalAnnualGoals: annualGoals.length,
      totalMonthlyGoals: monthlyGoals.length,
      totalWeeklyGoals: weeklyGoals.length,
      avgBreakdownProgress: totalAnnualBreakdownProgress / memberCount,
      avgExecutionProgress: totalAnnualExecutionProgress / memberCount,
      avgMonthlyBreakdownProgress: totalMonthlyBreakdownProgress / memberCount,
      avgMonthlyExecutionProgress: totalMonthlyExecutionProgress / memberCount,
      topPerformers,
    };
  }, [members, annualGoals, monthlyGoals, weeklyGoals, getMemberProgress]);

  // 获取成员的所有目标
  const getMemberGoals = useCallback((memberId: string) => {
    return {
      annual: annualGoals.filter(g => g.memberId === memberId),
      monthly: monthlyGoals.filter(g => g.memberId === memberId),
      weekly: weeklyGoals.filter(g => g.memberId === memberId),
    };
  }, [annualGoals, monthlyGoals, weeklyGoals]);

  // 切换团队
  const switchTeam = useCallback((newTeamCode: string) => {
    setTeamCode(newTeamCode);
    setTeamCodeState(newTeamCode);
    setMembers([]);
    setAnnualGoals([]);
    setMonthlyGoals([]);
    setWeeklyGoals([]);
    setIsLoading(true);
  }, []);

  // 获取分享链接
  const getShareLink = useCallback(() => {
    if (!teamCode) return '';
    return generateShareLink(teamCode);
  }, [teamCode]);

  return {
    members,
    annualGoals,
    monthlyGoals,
    weeklyGoals,
    isLoading,
    teamCode,
    isOnline,
    syncStatus,
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
    getMemberGoals,
    switchTeam,
    getShareLink,
  };
};
