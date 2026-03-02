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
import { anonymousAuth, checkConnection, debugLog } from '@/cloudbase/config';

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

// 调试日志类型
interface DebugLog {
  id: string;
  time: string;
  message: string;
  data?: any;
}

export const useTeamCloudBase = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [annualGoals, setAnnualGoals] = useState<TeamMemberAnnualGoal[]>([]);
  const [monthlyGoals, setMonthlyGoals] = useState<TeamMemberMonthlyGoal[]>([]);
  const [weeklyGoals, setWeeklyGoals] = useState<TeamMemberWeeklyGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [teamCode, setTeamCodeState] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [isCloudConnected, setIsCloudConnected] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [debugLogs, setDebugLogs] = useState<DebugLog[]>([]);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  
  // 使用 ref 存储监听器
  const listenersRef = useRef<{ close: () => void }[]>([]);
  const teamCodeRef = useRef<string | null>(null);

  // 添加调试日志
  const addDebugLog = useCallback((message: string, data?: any) => {
    const log: DebugLog = {
      id: Date.now().toString(),
      time: new Date().toLocaleTimeString(),
      message,
      data,
    };
    setDebugLogs(prev => [log, ...prev].slice(0, 50)); // 只保留最近50条
    debugLog(message, data);
  }, []);

  // 更新 teamCode ref
  useEffect(() => {
    teamCodeRef.current = teamCode;
  }, [teamCode]);

  // 监听网络状态
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      addDebugLog('网络已连接');
      // 网络恢复时同步离线数据
      syncOfflineData();
    };
    const handleOffline = () => {
      setIsOnline(false);
      addDebugLog('网络已断开');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [addDebugLog]);

  // 检查 CloudBase 连接状态
  const checkCloudConnection = useCallback(async () => {
    const connected = await checkConnection();
    setIsCloudConnected(connected);
    addDebugLog(`CloudBase 连接状态: ${connected ? '已连接' : '未连接'}`);
    return connected;
  }, [addDebugLog]);

  // 初始化团队码
  useEffect(() => {
    const initTeam = async () => {
      addDebugLog('初始化团队...');
      
      let code = getCurrentTeamCode();
      addDebugLog('当前团队码:', code);
      
      // 如果没有团队码，创建新团队
      if (!code) {
        code = createNewTeam();
        addDebugLog('创建新团队码:', code);
      }
      
      setTeamCodeState(code);
      
      // 匿名登录
      try {
        addDebugLog('开始匿名登录...');
        const loginResult = await anonymousAuth();
        addDebugLog('匿名登录结果:', loginResult);
        
        if (loginResult) {
          setIsCloudConnected(true);
        }
      } catch (error) {
        addDebugLog('匿名登录失败:', error);
      }
    };

    initTeam();
  }, [addDebugLog]);

  // 加载数据并设置实时监听
  useEffect(() => {
    if (!teamCode) return;

    addDebugLog('开始加载数据，团队码:', teamCode);

    // 先尝试从本地缓存加载（离线支持）
    loadFromLocalStorage();

    // 然后加载云端数据
    loadCloudData();

    // 设置实时监听
    setupRealtimeListeners();

    return () => {
      // 清理监听器
      addDebugLog('清理监听器');
      listenersRef.current.forEach(listener => listener.close());
      listenersRef.current = [];
    };
  }, [teamCode, addDebugLog]);

  // 从本地存储加载数据（离线支持）
  const loadFromLocalStorage = () => {
    if (!teamCode) return;
    
    try {
      addDebugLog('从本地存储加载数据');
      const membersData = localStorage.getItem(`${OFFLINE_MEMBERS_KEY}_${teamCode}`);
      const annualData = localStorage.getItem(`${OFFLINE_ANNUAL_GOALS_KEY}_${teamCode}`);
      const monthlyData = localStorage.getItem(`${OFFLINE_MONTHLY_GOALS_KEY}_${teamCode}`);
      const weeklyData = localStorage.getItem(`${OFFLINE_WEEKLY_GOALS_KEY}_${teamCode}`);

      if (membersData) {
        const parsed = JSON.parse(membersData);
        setMembers(parsed);
        addDebugLog('从本地加载成员:', parsed.length);
      }
      if (annualData) {
        const parsed = JSON.parse(annualData);
        setAnnualGoals(parsed);
        addDebugLog('从本地加载年度目标:', parsed.length);
      }
      if (monthlyData) {
        const parsed = JSON.parse(monthlyData);
        setMonthlyGoals(parsed);
        addDebugLog('从本地加载月度目标:', parsed.length);
      }
      if (weeklyData) {
        const parsed = JSON.parse(weeklyData);
        setWeeklyGoals(parsed);
        addDebugLog('从本地加载周目标:', parsed.length);
      }
    } catch (error) {
      addDebugLog('从本地存储加载数据失败:', error);
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
      addDebugLog('数据已保存到本地存储');
    } catch (error) {
      addDebugLog('保存到本地存储失败:', error);
    }
  }, [addDebugLog]);

  // 加载云端数据
  const loadCloudData = async () => {
    if (!teamCode) return;

    setIsLoading(true);
    setSyncStatus('syncing');
    addDebugLog('开始从云端加载数据');

    try {
      // 并行加载所有数据
      const [membersData, annualData, monthlyData, weeklyData] = await Promise.all([
        memberDB.getAll(teamCode),
        annualGoalDB.getAll(teamCode),
        monthlyGoalDB.getAll(teamCode),
        weeklyGoalDB.getAll(teamCode),
      ]);

      addDebugLog('云端数据加载结果:', {
        members: membersData.length,
        annualGoals: annualData.length,
        monthlyGoals: monthlyData.length,
        weeklyGoals: weeklyData.length,
      });

      // 如果有云端数据，使用云端数据；否则保留本地数据
      if (membersData.length > 0) {
        setMembers(membersData);
      }
      if (annualData.length > 0) {
        setAnnualGoals(annualData);
      }
      if (monthlyData.length > 0) {
        setMonthlyGoals(monthlyData);
      }
      if (weeklyData.length > 0) {
        setWeeklyGoals(weeklyData);
      }

      // 保存到本地存储
      saveToLocalStorage(
        membersData.length > 0 ? membersData : members,
        annualData.length > 0 ? annualData : annualGoals,
        monthlyData.length > 0 ? monthlyData : monthlyGoals,
        weeklyData.length > 0 ? weeklyData : weeklyGoals
      );

      setSyncStatus('synced');
      addDebugLog('云端数据加载完成');
    } catch (error) {
      addDebugLog('加载云端数据失败:', error);
      setSyncStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  // 设置实时监听器
  const setupRealtimeListeners = () => {
    if (!teamCode) return;

    addDebugLog('设置实时监听器');

    // 清理旧监听器
    listenersRef.current.forEach(listener => listener.close());
    listenersRef.current = [];

    // 监听成员变化
    const memberListener = memberDB.onSnapshot(teamCode, (newMembers) => {
      addDebugLog('收到成员数据更新:', newMembers.length);
      setMembers(newMembers);
      saveToLocalStorage(newMembers, annualGoals, monthlyGoals, weeklyGoals);
    });
    listenersRef.current.push(memberListener);

    // 监听年度目标变化
    const annualListener = annualGoalDB.onSnapshot(teamCode, (newGoals) => {
      addDebugLog('收到年度目标数据更新:', newGoals.length);
      setAnnualGoals(newGoals);
      saveToLocalStorage(members, newGoals, monthlyGoals, weeklyGoals);
    });
    listenersRef.current.push(annualListener);

    // 监听月度目标变化
    const monthlyListener = monthlyGoalDB.onSnapshot(teamCode, (newGoals) => {
      addDebugLog('收到月度目标数据更新:', newGoals.length);
      setMonthlyGoals(newGoals);
      saveToLocalStorage(members, annualGoals, newGoals, weeklyGoals);
    });
    listenersRef.current.push(monthlyListener);

    // 监听周目标变化
    const weeklyListener = weeklyGoalDB.onSnapshot(teamCode, (newGoals) => {
      addDebugLog('收到周目标数据更新:', newGoals.length);
      setWeeklyGoals(newGoals);
      saveToLocalStorage(members, annualGoals, monthlyGoals, newGoals);
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
      addDebugLog(`开始同步 ${queue.length} 条离线数据`);

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
          addDebugLog(`同步离线操作失败:`, { op, error });
        }
      }

      // 清空队列
      localStorage.removeItem(`${OFFLINE_QUEUE_KEY}_${teamCode}`);
      setSyncStatus('synced');
      addDebugLog('离线数据同步完成');

      // 重新加载数据
      await loadCloudData();
    } catch (error) {
      addDebugLog('同步离线数据失败:', error);
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
      addDebugLog('添加到离线队列:', operation);
    } catch (error) {
      addDebugLog('添加到离线队列失败:', error);
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
    addDebugLog('乐观更新：创建成员', newMember);

    if (isOnline && isCloudConnected) {
      const result = await memberDB.create(teamCode, member);
      if (result) {
        addDebugLog('云端创建成员成功');
      } else {
        addDebugLog('云端创建成员失败，添加到离线队列');
        addToOfflineQueue({
          id: newMember.id,
          type: 'create',
          collection: 'members',
          data: member,
        });
      }
    } else {
      addDebugLog('离线状态，添加到离线队列');
      addToOfflineQueue({
        id: newMember.id,
        type: 'create',
        collection: 'members',
        data: member,
      });
    }

    return newMember;
  }, [teamCode, members, annualGoals, monthlyGoals, weeklyGoals, isOnline, isCloudConnected, saveToLocalStorage, addDebugLog]);

  const updateMember = useCallback(async (id: string, updates: Partial<TeamMember>) => {
    if (!teamCode) return;

    // 乐观更新
    const updated = members.map(m => 
      m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m
    );
    setMembers(updated);
    saveToLocalStorage(updated, annualGoals, monthlyGoals, weeklyGoals);
    addDebugLog('乐观更新：更新成员', { id, updates });

    if (isOnline && isCloudConnected) {
      const result = await memberDB.update(teamCode, id, updates);
      if (!result) {
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
  }, [teamCode, members, annualGoals, monthlyGoals, weeklyGoals, isOnline, isCloudConnected, saveToLocalStorage, addDebugLog]);

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
    addDebugLog('乐观更新：删除成员', id);

    if (isOnline && isCloudConnected) {
      await memberDB.delete(teamCode, id);
    } else {
      addToOfflineQueue({
        id,
        type: 'delete',
        collection: 'members',
      });
    }
  }, [teamCode, members, annualGoals, monthlyGoals, weeklyGoals, isOnline, isCloudConnected, saveToLocalStorage, addDebugLog]);

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
    addDebugLog('乐观更新：创建年度目标', newGoal);

    if (isOnline && isCloudConnected) {
      await annualGoalDB.create(teamCode, goal);
    } else {
      addToOfflineQueue({
        id: newGoal.id,
        type: 'create',
        collection: 'annual_goals',
        data: goal,
      });
    }

    return newGoal;
  }, [teamCode, members, annualGoals, monthlyGoals, weeklyGoals, isOnline, isCloudConnected, saveToLocalStorage, addDebugLog]);

  const updateAnnualGoal = useCallback(async (id: string, updates: Partial<TeamMemberAnnualGoal>) => {
    if (!teamCode) return;

    const updated = annualGoals.map(g => 
      g.id === id ? { ...g, ...updates, updatedAt: new Date().toISOString() } : g
    );
    setAnnualGoals(updated);
    saveToLocalStorage(members, updated, monthlyGoals, weeklyGoals);
    addDebugLog('乐观更新：更新年度目标', { id, updates });

    if (isOnline && isCloudConnected) {
      await annualGoalDB.update(teamCode, id, updates);
    } else {
      addToOfflineQueue({
        id,
        type: 'update',
        collection: 'annual_goals',
        data: updates,
      });
    }
  }, [teamCode, members, annualGoals, monthlyGoals, weeklyGoals, isOnline, isCloudConnected, saveToLocalStorage, addDebugLog]);

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
    addDebugLog('乐观更新：更新年度目标实际完成', { id, actualBreakdown, actualExecution });

    if (isOnline && isCloudConnected) {
      await annualGoalDB.updateActual(teamCode, id, actualBreakdown, actualExecution);
    } else {
      addToOfflineQueue({
        id,
        type: 'update',
        collection: 'annual_goals',
        data: { actualBreakdown, actualExecution },
      });
    }
  }, [teamCode, members, annualGoals, monthlyGoals, weeklyGoals, isOnline, isCloudConnected, saveToLocalStorage, addDebugLog]);

  const deleteAnnualGoal = useCallback(async (id: string) => {
    if (!teamCode) return;

    const updatedAnnual = annualGoals.filter(g => g.id !== id);
    setAnnualGoals(updatedAnnual);

    const updatedMonthly = monthlyGoals.filter(g => g.annualGoalId !== id);
    setMonthlyGoals(updatedMonthly);

    const monthlyGoalIds = monthlyGoals.filter(g => g.annualGoalId === id).map(g => g.id);
    const updatedWeekly = weeklyGoals.filter(g => !monthlyGoalIds.includes(g.monthlyGoalId));
    setWeeklyGoals(updatedWeekly);

    saveToLocalStorage(members, updatedAnnual, updatedMonthly, updatedWeekly);
    addDebugLog('乐观更新：删除年度目标', id);

    if (isOnline && isCloudConnected) {
      await annualGoalDB.delete(teamCode, id);
    } else {
      addToOfflineQueue({
        id,
        type: 'delete',
        collection: 'annual_goals',
      });
    }
  }, [teamCode, members, annualGoals, monthlyGoals, weeklyGoals, isOnline, isCloudConnected, saveToLocalStorage, addDebugLog]);

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
    addDebugLog('乐观更新：创建月度目标', newGoal);

    if (isOnline && isCloudConnected) {
      await monthlyGoalDB.create(teamCode, goal);
    } else {
      addToOfflineQueue({
        id: newGoal.id,
        type: 'create',
        collection: 'monthly_goals',
        data: goal,
      });
    }

    return newGoal;
  }, [teamCode, members, annualGoals, monthlyGoals, weeklyGoals, isOnline, isCloudConnected, saveToLocalStorage, addDebugLog]);

  const updateMonthlyGoal = useCallback(async (id: string, updates: Partial<TeamMemberMonthlyGoal>) => {
    if (!teamCode) return;

    const updated = monthlyGoals.map(g => 
      g.id === id ? { ...g, ...updates, updatedAt: new Date().toISOString() } : g
    );
    setMonthlyGoals(updated);
    saveToLocalStorage(members, annualGoals, updated, weeklyGoals);
    addDebugLog('乐观更新：更新月度目标', { id, updates });

    if (isOnline && isCloudConnected) {
      await monthlyGoalDB.update(teamCode, id, updates);
    } else {
      addToOfflineQueue({
        id,
        type: 'update',
        collection: 'monthly_goals',
        data: updates,
      });
    }
  }, [teamCode, members, annualGoals, monthlyGoals, weeklyGoals, isOnline, isCloudConnected, saveToLocalStorage, addDebugLog]);

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
    addDebugLog('乐观更新：更新月度目标实际完成', { id, actualBreakdown, actualExecution });

    if (isOnline && isCloudConnected) {
      await monthlyGoalDB.updateActual(teamCode, id, actualBreakdown, actualExecution);
    } else {
      addToOfflineQueue({
        id,
        type: 'update',
        collection: 'monthly_goals',
        data: { actualBreakdown, actualExecution },
      });
    }
  }, [teamCode, members, annualGoals, monthlyGoals, weeklyGoals, isOnline, isCloudConnected, saveToLocalStorage, addDebugLog]);

  const deleteMonthlyGoal = useCallback(async (id: string) => {
    if (!teamCode) return;

    const updatedMonthly = monthlyGoals.filter(g => g.id !== id);
    setMonthlyGoals(updatedMonthly);

    const updatedWeekly = weeklyGoals.filter(g => g.monthlyGoalId !== id);
    setWeeklyGoals(updatedWeekly);

    saveToLocalStorage(members, annualGoals, updatedMonthly, updatedWeekly);
    addDebugLog('乐观更新：删除月度目标', id);

    if (isOnline && isCloudConnected) {
      await monthlyGoalDB.delete(teamCode, id);
    } else {
      addToOfflineQueue({
        id,
        type: 'delete',
        collection: 'monthly_goals',
      });
    }
  }, [teamCode, members, annualGoals, monthlyGoals, weeklyGoals, isOnline, isCloudConnected, saveToLocalStorage, addDebugLog]);

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
    addDebugLog('乐观更新：创建周目标', newGoal);

    if (isOnline && isCloudConnected) {
      await weeklyGoalDB.create(teamCode, goal);
    } else {
      addToOfflineQueue({
        id: newGoal.id,
        type: 'create',
        collection: 'weekly_goals',
        data: goal,
      });
    }

    return newGoal;
  }, [teamCode, members, annualGoals, monthlyGoals, weeklyGoals, isOnline, isCloudConnected, saveToLocalStorage, addDebugLog]);

  const updateWeeklyGoal = useCallback(async (id: string, updates: Partial<TeamMemberWeeklyGoal>) => {
    if (!teamCode) return;

    const updated = weeklyGoals.map(g => 
      g.id === id ? { ...g, ...updates, updatedAt: new Date().toISOString() } : g
    );
    setWeeklyGoals(updated);
    saveToLocalStorage(members, annualGoals, monthlyGoals, updated);
    addDebugLog('乐观更新：更新周目标', { id, updates });

    if (isOnline && isCloudConnected) {
      await weeklyGoalDB.update(teamCode, id, updates);
    } else {
      addToOfflineQueue({
        id,
        type: 'update',
        collection: 'weekly_goals',
        data: updates,
      });
    }
  }, [teamCode, members, annualGoals, monthlyGoals, weeklyGoals, isOnline, isCloudConnected, saveToLocalStorage, addDebugLog]);

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
    addDebugLog('乐观更新：更新周目标实际完成', { id, actualBreakdown, actualExecution });

    if (isOnline && isCloudConnected) {
      await weeklyGoalDB.updateActual(teamCode, id, actualBreakdown, actualExecution);
    } else {
      addToOfflineQueue({
        id,
        type: 'update',
        collection: 'weekly_goals',
        data: { actualBreakdown, actualExecution },
      });
    }
  }, [teamCode, members, annualGoals, monthlyGoals, weeklyGoals, isOnline, isCloudConnected, saveToLocalStorage, addDebugLog]);

  const deleteWeeklyGoal = useCallback(async (id: string) => {
    if (!teamCode) return;

    const updatedWeekly = weeklyGoals.filter(g => g.id !== id);
    setWeeklyGoals(updatedWeekly);
    saveToLocalStorage(members, annualGoals, monthlyGoals, updatedWeekly);
    addDebugLog('乐观更新：删除周目标', id);

    if (isOnline && isCloudConnected) {
      await weeklyGoalDB.delete(teamCode, id);
    } else {
      addToOfflineQueue({
        id,
        type: 'delete',
        collection: 'weekly_goals',
      });
    }
  }, [teamCode, members, annualGoals, monthlyGoals, weeklyGoals, isOnline, isCloudConnected, saveToLocalStorage, addDebugLog]);

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

  // 手动刷新数据
  const refreshData = useCallback(async () => {
    addDebugLog('手动刷新数据');
    await loadCloudData();
  }, [addDebugLog]);

  // 清除调试日志
  const clearDebugLogs = useCallback(() => {
    setDebugLogs([]);
  }, []);

  return {
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
    getMemberGoals,
    switchTeam,
    getShareLink,
    refreshData,
    clearDebugLogs,
    checkCloudConnection,
  };
};
